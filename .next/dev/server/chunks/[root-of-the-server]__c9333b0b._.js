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
"[project]/app/api/sales/stats/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/index.mjs [app-route] (ecmascript) <locals>");
;
;
const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(("TURBOPACK compile-time value", "https://ltxmhawsjyjshnmtqgsx.supabase.co"), ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0eG1oYXdzanlqc2hubXRxZ3N4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxNzM0MDksImV4cCI6MjA4MTc0OTQwOX0.Y_QlYoYR85SVvIQdudeOnHz4r6WO82XLpDzosuhdVMk"));
async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const period = searchParams.get('period') || 'today' // today, week, month, year
        ;
        let dateFilter = '';
        const today = new Date().toISOString().split('T')[0];
        switch(period){
            case 'today':
                dateFilter = `sale_date.gte.${today}T00:00:00,sale_date.lte.${today}T23:59:59`;
                break;
            case 'week':
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                dateFilter = `sale_date.gte.${weekAgo.toISOString()}`;
                break;
            case 'month':
                const monthAgo = new Date();
                monthAgo.setDate(monthAgo.getDate() - 30);
                dateFilter = `sale_date.gte.${monthAgo.toISOString()}`;
                break;
            case 'year':
                const yearAgo = new Date();
                yearAgo.setFullYear(yearAgo.getFullYear() - 1);
                dateFilter = `sale_date.gte.${yearAgo.toISOString()}`;
                break;
        }
        // Get basic sales stats
        let salesQuery = supabase.from('sales').select('quantity, total_price, customer_name, sale_date');
        if (dateFilter) {
            const [field, operator, value] = dateFilter.split('.');
            if (operator === 'gte') {
                salesQuery = salesQuery.gte(field, value);
            } else if (operator === 'lte') {
                salesQuery = salesQuery.lte(field, value);
            }
        }
        const { data: salesData, error: salesError } = await salesQuery;
        if (salesError) {
            console.error('Sales query error:', salesError);
            throw salesError;
        }
        // Calculate stats
        const totalTransactions = salesData?.length || 0;
        const totalUnits = salesData?.reduce((sum, sale)=>sum + (sale.quantity || 0), 0) || 0;
        const totalRevenue = salesData?.reduce((sum, sale)=>sum + (sale.total_price || 0), 0) || 0;
        const averageSale = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
        const uniqueCustomers = new Set(salesData?.map((sale)=>sale.customer_name).filter(Boolean)).size;
        // Get top medicines (need to join with medicines table or use medicine names from sales)
        const { data: topMedicinesData, error: topMedicinesError } = await supabase.from('sales').select(`
        medicine_id,
        quantity,
        total_price,
        medicines (name, category)
      `).order('quantity', {
            ascending: false
        }).limit(10);
        if (topMedicinesError) {
            console.error('Top medicines query error:', topMedicinesError);
        }
        // Group top medicines by medicine_id
        const medicineMap = new Map();
        topMedicinesData?.forEach((sale)=>{
            const medicineId = sale.medicine_id;
            const medicines = sale.medicines// Type assertion for the relation
            ;
            const medicineName = medicines?.name || 'Unknown Medicine';
            const category = medicines?.category || 'General';
            if (medicineMap.has(medicineId)) {
                const existing = medicineMap.get(medicineId);
                existing.total_sold += sale.quantity || 0;
                existing.revenue += sale.total_price || 0;
            } else {
                medicineMap.set(medicineId, {
                    medicine_name: medicineName,
                    category: category,
                    total_sold: sale.quantity || 0,
                    revenue: sale.total_price || 0
                });
            }
        });
        const topMedicines = Array.from(medicineMap.values()).sort((a, b)=>b.total_sold - a.total_sold).slice(0, 10);
        // Get daily sales trend (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const { data: trendData, error: trendError } = await supabase.from('sales').select('sale_date, quantity, total_price').gte('sale_date', sevenDaysAgo.toISOString()).order('sale_date', {
            ascending: true
        });
        if (trendError) {
            console.error('Trend query error:', trendError);
        }
        // Group trend data by day
        const trendMap = new Map();
        trendData?.forEach((sale)=>{
            const day = sale.sale_date.split('T')[0] // Get just the date part
            ;
            if (trendMap.has(day)) {
                const existing = trendMap.get(day);
                existing.transactions += 1;
                existing.revenue += sale.total_price || 0;
                existing.units_sold += sale.quantity || 0;
            } else {
                trendMap.set(day, {
                    sale_day: day,
                    transactions: 1,
                    revenue: sale.total_price || 0,
                    units_sold: sale.quantity || 0
                });
            }
        });
        const salesTrend = Array.from(trendMap.values()).sort((a, b)=>new Date(a.sale_day).getTime() - new Date(b.sale_day).getTime());
        // Mock payment methods data (since we don't have this field in current schema)
        const paymentMethods = [
            {
                payment_method: 'Cash',
                transaction_count: Math.floor(totalTransactions * 0.6),
                revenue: totalRevenue * 0.6
            },
            {
                payment_method: 'Card',
                transaction_count: Math.floor(totalTransactions * 0.3),
                revenue: totalRevenue * 0.3
            },
            {
                payment_method: 'UPI',
                transaction_count: Math.floor(totalTransactions * 0.1),
                revenue: totalRevenue * 0.1
            }
        ];
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            data: {
                summary: {
                    total_transactions: totalTransactions,
                    total_units_sold: totalUnits,
                    total_revenue: totalRevenue,
                    average_sale_value: averageSale,
                    unique_customers: uniqueCustomers
                },
                paymentMethods: paymentMethods,
                topMedicines: topMedicines,
                salesTrend: salesTrend,
                period: period
            }
        });
    } catch (error) {
        console.error('Sales Stats API Error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: 'Failed to fetch sales statistics',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__c9333b0b._.js.map