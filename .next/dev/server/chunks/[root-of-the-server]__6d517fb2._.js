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
"[project]/app/api/analytics/demand-patterns/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
        const timeframe = searchParams.get('timeframe') || '3months';
        // Calculate date range
        const daysBack = {
            '1month': 30,
            '3months': 90,
            '6months': 180,
            '1year': 365
        }[timeframe] || 90;
        const startDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);
        // Get sales data
        const { data: salesData, error: salesError } = await supabase.from('sales').select(`
        *,
        medicines (name)
      `).gte('created_at', startDate.toISOString()).order('created_at');
        if (salesError) throw salesError;
        // Get current inventory
        const { data: inventoryData, error: inventoryError } = await supabase.from('inventory').select('medicine_id, quantity');
        if (inventoryError) throw inventoryError;
        // Process sales data to detect patterns
        const medicineMap = new Map();
        salesData?.forEach((sale)=>{
            const medicineId = sale.medicine_id;
            const medicineName = sale.medicines?.name;
            const saleDate = new Date(sale.created_at);
            if (!medicineMap.has(medicineId)) {
                medicineMap.set(medicineId, {
                    id: medicineId,
                    name: medicineName,
                    sales: []
                });
            }
            medicineMap.get(medicineId).sales.push({
                date: sale.created_at,
                quantity: sale.quantity,
                day_of_week: saleDate.getDay(),
                month: saleDate.getMonth(),
                hour: saleDate.getHours()
            });
        });
        const patterns = [];
        for (const [medicineId, medicineData] of medicineMap.entries()){
            const analysis = analyzeDemandPattern(medicineData.sales);
            if (analysis.confidence_score > 30) {
                const currentStock = inventoryData?.find((inv)=>inv.medicine_id === medicineId)?.quantity || 0;
                patterns.push({
                    id: medicineId,
                    medicine_name: medicineData.name,
                    pattern_type: analysis.pattern_type,
                    confidence_score: analysis.confidence_score,
                    next_spike_date: analysis.next_spike_date,
                    recommended_stock_increase: analysis.recommended_increase,
                    current_stock: currentStock,
                    historical_data: analysis.historical_data,
                    factors: analysis.factors,
                    peak_periods: analysis.peak_periods
                });
            }
        }
        // Sort by confidence score
        patterns.sort((a, b)=>b.confidence_score - a.confidence_score);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            patterns: patterns.slice(0, 15) // Top 15 patterns
        });
    } catch (error) {
        console.error('Error analyzing demand patterns:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: 'Failed to analyze demand patterns'
        }, {
            status: 500
        });
    }
}
function analyzeDemandPattern(sales) {
    if (sales.length < 10) {
        return {
            confidence_score: 0
        };
    }
    // Group sales by different time periods
    const dailyTotals = groupSalesByPeriod(sales, 'daily');
    const weeklyTotals = groupSalesByPeriod(sales, 'weekly');
    const monthlyTotals = groupSalesByPeriod(sales, 'monthly');
    // Detect different pattern types
    const seasonalPattern = detectSeasonalPattern(monthlyTotals);
    const weeklyPattern = detectWeeklyPattern(sales);
    const spikePattern = detectSpikePattern(dailyTotals);
    // Determine the strongest pattern
    let dominantPattern = {
        type: 'spike',
        confidence: 0,
        data: spikePattern
    };
    if (seasonalPattern.confidence > dominantPattern.confidence) {
        dominantPattern = {
            type: 'seasonal',
            confidence: seasonalPattern.confidence,
            data: seasonalPattern
        };
    }
    if (weeklyPattern.confidence > dominantPattern.confidence) {
        dominantPattern = {
            type: 'weekly',
            confidence: weeklyPattern.confidence,
            data: weeklyPattern
        };
    }
    // Generate historical data for visualization
    const historicalData = dailyTotals.map((item)=>({
            date: item.date,
            sales_volume: item.total
        }));
    // Predict next spike
    const nextSpikeDate = predictNextSpike(dominantPattern, sales);
    // Calculate recommended stock increase
    const avgDailySales = sales.reduce((sum, s)=>sum + s.quantity, 0) / sales.length;
    const recommendedIncrease = Math.ceil(avgDailySales * 7) // 1 week buffer
    ;
    return {
        pattern_type: dominantPattern.type,
        confidence_score: Math.round(dominantPattern.confidence),
        next_spike_date: nextSpikeDate,
        recommended_increase: recommendedIncrease,
        historical_data: historicalData.slice(-30),
        factors: generateFactors(dominantPattern, sales),
        peak_periods: generatePeakPeriods(dominantPattern, sales)
    };
}
function groupSalesByPeriod(sales, period) {
    const groups = new Map();
    sales.forEach((sale)=>{
        const date = new Date(sale.date);
        let key;
        switch(period){
            case 'daily':
                key = date.toISOString().split('T')[0];
                break;
            case 'weekly':
                const weekStart = new Date(date);
                weekStart.setDate(date.getDate() - date.getDay());
                key = weekStart.toISOString().split('T')[0];
                break;
            case 'monthly':
                key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                break;
            default:
                key = date.toISOString().split('T')[0];
        }
        if (!groups.has(key)) {
            groups.set(key, {
                date: key,
                total: 0,
                count: 0
            });
        }
        groups.get(key).total += sale.quantity;
        groups.get(key).count += 1;
    });
    return Array.from(groups.values()).sort((a, b)=>a.date.localeCompare(b.date));
}
function detectSeasonalPattern(monthlyData) {
    if (monthlyData.length < 6) return {
        confidence: 0
    };
    // Simple seasonal detection - look for recurring monthly patterns
    const monthlyAverages = new Map();
    monthlyData.forEach((item)=>{
        const month = item.date.split('-')[1];
        if (!monthlyAverages.has(month)) {
            monthlyAverages.set(month, []);
        }
        monthlyAverages.get(month).push(item.total);
    });
    // Calculate coefficient of variation for each month
    let totalVariation = 0;
    let monthCount = 0;
    for (const [month, values] of monthlyAverages.entries()){
        if (values.length > 1) {
            const mean = values.reduce((sum, v)=>sum + v, 0) / values.length;
            const variance = values.reduce((sum, v)=>sum + Math.pow(v - mean, 2), 0) / values.length;
            const cv = Math.sqrt(variance) / mean;
            totalVariation += cv;
            monthCount++;
        }
    }
    const avgVariation = monthCount > 0 ? totalVariation / monthCount : 1;
    const confidence = Math.max(0, Math.min(100, (1 - avgVariation) * 100));
    return {
        confidence,
        monthlyAverages
    };
}
function detectWeeklyPattern(sales) {
    // Group by day of week
    const dayTotals = new Array(7).fill(0);
    const dayCounts = new Array(7).fill(0);
    sales.forEach((sale)=>{
        dayTotals[sale.day_of_week] += sale.quantity;
        dayCounts[sale.day_of_week]++;
    });
    const dayAverages = dayTotals.map((total, i)=>dayCounts[i] > 0 ? total / dayCounts[i] : 0);
    // Calculate variation across days
    const mean = dayAverages.reduce((sum, avg)=>sum + avg, 0) / 7;
    const variance = dayAverages.reduce((sum, avg)=>sum + Math.pow(avg - mean, 2), 0) / 7;
    const cv = Math.sqrt(variance) / mean;
    const confidence = Math.max(0, Math.min(100, cv * 50)) // Higher variation = higher confidence in weekly pattern
    ;
    return {
        confidence,
        dayAverages
    };
}
function detectSpikePattern(dailyData) {
    if (dailyData.length < 7) return {
        confidence: 0
    };
    // Calculate moving average and identify spikes
    const windowSize = 7;
    const spikes = [];
    for(let i = windowSize; i < dailyData.length; i++){
        const window = dailyData.slice(i - windowSize, i);
        const avg = window.reduce((sum, item)=>sum + item.total, 0) / windowSize;
        const current = dailyData[i].total;
        if (current > avg * 1.5) {
            spikes.push({
                date: dailyData[i].date,
                value: current,
                multiplier: current / avg
            });
        }
    }
    const confidence = Math.min(100, spikes.length * 10) // More spikes = higher confidence
    ;
    return {
        confidence,
        spikes
    };
}
function predictNextSpike(pattern, sales) {
    const now = new Date();
    switch(pattern.type){
        case 'weekly':
            // Find the day with highest average sales
            const bestDay = pattern.data.dayAverages.indexOf(Math.max(...pattern.data.dayAverages));
            const nextDate = new Date(now);
            nextDate.setDate(now.getDate() + (bestDay - now.getDay() + 7) % 7);
            return nextDate.toISOString();
        case 'seasonal':
            // Predict based on historical monthly patterns
            const currentMonth = now.getMonth() + 1;
            const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
            const nextDate2 = new Date(now.getFullYear(), nextMonth - 1, 1);
            return nextDate2.toISOString();
        default:
            // Default to 2 weeks from now
            const defaultDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
            return defaultDate.toISOString();
    }
}
function generateFactors(pattern, sales) {
    const factors = [];
    if (pattern.type === 'seasonal') {
        factors.push('Seasonal demand variations detected');
        factors.push('Monthly sales patterns identified');
    }
    if (pattern.type === 'weekly') {
        factors.push('Weekly demand cycles observed');
        factors.push('Day-of-week preferences identified');
    }
    if (pattern.confidence > 70) {
        factors.push('High confidence pattern recognition');
    }
    factors.push('Historical sales data analysis');
    factors.push('Market demand fluctuations');
    return factors.slice(0, 4);
}
function generatePeakPeriods(pattern, sales) {
    const periods = [];
    if (pattern.type === 'weekly' && pattern.data.dayAverages) {
        const days = [
            'Sunday',
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday'
        ];
        const maxIndex = pattern.data.dayAverages.indexOf(Math.max(...pattern.data.dayAverages));
        periods.push(`${days[maxIndex]}s show highest demand`);
    }
    if (pattern.type === 'seasonal') {
        periods.push('Seasonal peaks in specific months');
    }
    periods.push('End of month increased activity');
    periods.push('Holiday season demand spikes');
    return periods.slice(0, 3);
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__6d517fb2._.js.map