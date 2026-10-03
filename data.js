// Shared database reads. Writes and validation reads always use fresh SDK data.
export * from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-database.js';
import { get as remoteGet, onValue as remoteOnValue, ref, query, orderByKey, startAt, endAt } from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-database.js';

const pending = new Map();
const memory = new Map();
const scope = JSON.stringify(['companyId', 'branch', 'role', 'name', 'adminId', 'adminEmail', 'impersonator_role'].map(key => localStorage.getItem(key)));
const prefix = `admin-read-v1:${scope}:`;
const ttl = 5 * 60 * 1000;
let replay = false;
let queue = Promise.resolve();
let dependencies = null;
const views = new Map();
const showLoading = () => globalThis.window?.AdminLoading?.begin() || (() => {});
const trackRead = promise => globalThis.window?.AdminLoading?.track(promise) || promise;
class CacheMiss extends Error {}

function read(key) {
    try {
        const saved = memory.get(key) || JSON.parse(sessionStorage.getItem(prefix + key));
        return saved && Date.now() - saved.time < ttl ? saved : null;
    } catch { return null; }
}

function save(key, snapshot) {
    if (/password|activationCodes/i.test(key)) return;
    // Credential fields are unnecessary for cached page rendering.
    const value = JSON.parse(JSON.stringify(snapshot.val(), (field, item) =>
        /password|token|secret/i.test(field) ? undefined : item));
    const saved = { time: Date.now(), value, key: snapshot.key };
    memory.set(key, saved);
    try {
        const json = JSON.stringify(saved);
        if (json.length < 256000) sessionStorage.setItem(prefix + key, json);
    } catch { /* Full or unavailable storage must never block live data. */ }
}

function snapshot(value, key) {
    return {
        key, val: () => value ?? null, exists: () => value !== null && value !== undefined,
        size: value && typeof value === 'object' ? Object.keys(value).length : 0,
        child(path) {
            let child = value;
            const parts = String(path).split('/').filter(Boolean);
            for (const part of parts) child = child?.[part];
            return snapshot(child, parts.at(-1) || key);
        },
        hasChild(path) { return this.child(path).exists(); },
        hasChildren() { return this.size > 0; },
        forEach(callback) {
            for (const [childKey, child] of Object.entries(value || {})) {
                if (child != null && callback(snapshot(child, childKey)) === true) return true;
            }
            return false;
        },
        toJSON: () => value ?? null
    };
}

export function get(query, cacheKey) {
    // Query URLs omit range/order constraints, so never share their URL cache.
    if (!cacheKey && !query.isEqual(query.ref)) {
        dependencies?.add('uncached-query');
        return trackRead(remoteGet(query));
    }
    const key = query.toString() + (cacheKey ? ':' + cacheKey : '');
    dependencies?.add(key);
    if (replay) {
        const saved = read(key);
        return saved ? Promise.resolve(snapshot(saved.value, saved.key)) : Promise.reject(new CacheMiss());
    }
    if (!pending.has(key)) {
        const request = trackRead(remoteGet(query)).then(value => { save(key, value); return value; }).finally(() => pending.delete(key));
        pending.set(key, request);
    }
    return pending.get(key);
}

export function replayingReads() { return replay; }

export async function monthlyRecords(db, month, employeeIds) {
    const attendance = {}, approvals = {};
    await Promise.all([...new Set(employeeIds.filter(Boolean))].map(async id => {
        const [days, approval] = await Promise.all([
            get(query(ref(db, `attendance/${id}`), orderByKey(), startAt(`${month}-01`), endAt(`${month}-31`)), month),
            get(ref(db, `salary_approvals/${id}/${month}`))
        ]);
        attendance[id] = days.val() || {};
        approvals[id] = { [month]: approval.val() };
    }));
    return [snapshot(attendance, 'attendance'), snapshot(approvals, 'salary_approvals')];
}

// Only read-only, idempotent render functions opt into replaying cached reads.
export function readView(render, name = render.name) {
    name = location.pathname + ':' + name;
    if (views.has(name)) return views.get(name);
    const run = async () => {
        let keys = [];
        try { keys = JSON.parse(sessionStorage.getItem(prefix + 'view:' + name)) || []; } catch {}
        if (keys.length && keys.every(key => read(key))) {
            replay = true;
            try { await render(); } catch (error) { if (!(error instanceof CacheMiss)) console.debug(error); }
            finally { replay = false; }
        }
        dependencies = new Set();
        try { return await render(); }
        finally {
            try { sessionStorage.setItem(prefix + 'view:' + name, JSON.stringify([...dependencies])); } catch {}
            dependencies = null;
        }
    };
    queue = queue.catch(() => {}).then(run);
    views.set(name, queue);
    queue.finally(() => views.delete(name)).catch(() => {});
    return queue;
}

export function cachedOnValue(query, callback, ...options) {
    if (!query.isEqual(query.ref)) {
        return globalThis.window?.AdminLoading
            ? window.AdminLoading.listen(remoteOnValue, query, callback, ...options)
            : remoteOnValue(query, callback, ...options);
    }
    const key = query.toString();
    const saved = read(key);
    const onlyOnce = options.some(option => option?.onlyOnce);
    let active = true;
    let receivedLive = false;
    const finish = showLoading();
    if (saved && !onlyOnce) queueMicrotask(() => {
        if (active && !receivedLive) {
            try { callback(snapshot(saved.value, saved.key)); } finally { finish(); }
        }
    });
    const cancel = typeof options[0] === 'function' ? options.shift() : null;
    let stop;
    try {
        stop = remoteOnValue(query, value => {
            receivedLive = true;
            try { save(key, value); callback(value); } finally { finish(); }
        }, error => { finish(); if (cancel) cancel(error); else console.error(error); }, ...options);
    } catch (error) { finish(); throw error; }
    return () => { active = false; finish(); stop(); };
}
