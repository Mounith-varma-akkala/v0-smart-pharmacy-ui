module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/app/api/inventory/expiry/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/index.mjs [app-route] (ecmascript) <locals>");
;
;
const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(("TURBOPACK compile-time value", "https://ltxmhawsjyjshnmtqgsx.supabase.co"), ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0eG1oYXdzanlqc2hubXRxZ3N4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxNzM0MDksImV4cCI6MjA4MTc0OTQwOX0.Y_QlYoYR85SVvIQdudeOnHz4r6WO82XLpDzosuhdVMk"));
async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const alertDays = parseInt(searchParams.get('alert_days') || '30');
        const { data: batches, error } = await supabase.from('inventory_batches').select(`
        *,
        medicines (name),
        suppliers (name)
      `).order('expiry_date', {
            ascending: true
        }) // FEFO ordering
        ;
        if (error) throw error;
        const currentDate = new Date();
        const processedBatches = batches?.map((batch)=>{
            const expiryDate = new Date(batch.expiry_date);
            const daysToExpiry = Math.ceil((expiryDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
            let expiryStatus;
            if (daysToExpiry < 0) {
                expiryStatus = 'expired';
            } else if (daysToExpiry <= 7) {
                expiryStatus = 'critical';
            } else if (daysToExpiry <= alertDays) {
                expiryStatus = 'warning';
            } else {
                expiryStatus = 'safe';
            }
            return {
                id: batch.id,
                medicine_name: batch.medicines?.name || 'Unknown Medicine',
                batch_number: batch.batch_number,
                expiry_date: batch.expiry_date,
                quantity: batch.quantity,
                cost_price: batch.cost_price,
                supplier_name: batch.suppliers?.name || 'Unknown Supplier',
                days_to_expiry: daysToExpiry,
                expiry_status: expiryStatus,
                suggested_for_sale: expiryStatus === 'warning' || expiryStatus === 'critical'
            };
        }) || [];
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            batches: processedBatches
        });
    } catch (error) {
        console.error('Error fetching inventory batches:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: 'Failed to fetch inventory batches'
        }, {
            status: 500
        });
    }
}
async function POST(request) {
    try {
        const { medicine_id, quantity_needed } = await request.json();
        const { data: batches, error } = await supabase.from('inventory_batches').select('*').eq('medicine_id', medicine_id).gt('quantity', 0).order('expiry_date', {
            ascending: true
        }) // FEFO: earliest expiry first
        ;
        if (error) throw error;
        let remainingQuantity = quantity_needed;
        const selectedBatches = [];
        for (const batch of batches || []){
            if (remainingQuantity <= 0) break;
            const quantityFromBatch = Math.min(batch.quantity, remainingQuantity);
            selectedBatches.push({
                batch_id: batch.id,
                batch_number: batch.batch_number,
                quantity: quantityFromBatch,
                expiry_date: batch.expiry_date
            });
            remainingQuantity -= quantityFromBatch;
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            selected_batches: selectedBatches,
            remaining_quantity: remainingQuantity
        });
    } catch (error) {
        console.error('Error applying FEFO logic:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: 'Failed to apply FEFO logic'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__52ba443f._.js.map