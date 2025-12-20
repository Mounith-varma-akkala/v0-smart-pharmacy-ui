// Diagnostic script to check MySQL integration
// Run with: node scripts/diagnose-integration.js

const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function diagnoseIntegration() {
  console.log('🔍 MySQL Integration Diagnostic Tool\n');
  
  // Check environment variables
  console.log('1. Environment Variables Check:');
  const requiredVars = ['MYSQL_HOST', 'MYSQL_USER', 'MYSQL_PASSWORD', 'MYSQL_DATABASE'];
  const missingVars = [];
  
  requiredVars.forEach(varName => {
    if (process.env[varName]) {
      console.log(`   ✅ ${varName}: ${varName === 'MYSQL_PASSWORD' ? '***' : process.env[varName]}`);
    } else {
      console.log(`   ❌ ${varName}: Not set`);
      missingVars.push(varName);
    }
  });
  
  if (missingVars.length > 0) {
    console.log(`\n❌ Missing environment variables: ${missingVars.join(', ')}`);
    console.log('Please update your .env.local file with the correct MySQL credentials.\n');
    return;
  }
  
  // Test MySQL connection
  console.log('\n2. MySQL Connection Test:');
  try {
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      port: parseInt(process.env.MYSQL_PORT || '3306'),
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
    });
    
    console.log('   ✅ MySQL connection successful');
    
    // Test basic query
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('   ✅ Basic query test passed');
    
    // Check if sales table exists
    try {
      const [tables] = await connection.execute(
        "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'sales'",
        [process.env.MYSQL_DATABASE]
      );
      
      if (tables.length > 0) {
        console.log('   ✅ Sales table exists');
        
        // Check sales table structure
        const [columns] = await connection.execute('DESCRIBE sales');
        console.log('   ✅ Sales table structure:');
        columns.forEach(col => {
          console.log(`      - ${col.Field}: ${col.Type}`);
        });
        
        // Check if there's any sample data
        const [salesCount] = await connection.execute('SELECT COUNT(*) as count FROM sales');
        console.log(`   📊 Sales records: ${salesCount[0].count}`);
        
      } else {
        console.log('   ❌ Sales table does not exist');
        console.log('   💡 Run the MySQL schema script: scripts/mysql_sales_schema.sql');
      }
    } catch (error) {
      console.log('   ❌ Error checking sales table:', error.message);
    }
    
    await connection.end();
    
  } catch (error) {
    console.log('   ❌ MySQL connection failed:', error.message);
    console.log('\n💡 Common solutions:');
    console.log('   - Check if MySQL server is running');
    console.log('   - Verify host, port, username, and password');
    console.log('   - Ensure the database exists');
    console.log('   - Check firewall settings');
    return;
  }
  
  // Test API endpoints
  console.log('\n3. API Endpoints Test:');
  try {
    // This would require the server to be running
    console.log('   ℹ️  To test API endpoints, visit:');
    console.log('   - http://localhost:3000/api/test-mysql');
    console.log('   - http://localhost:3000/api/sales/stats?period=today');
    console.log('   - http://localhost:3000/test-integration');
  } catch (error) {
    console.log('   ❌ API test failed:', error.message);
  }
  
  console.log('\n✅ Diagnostic complete!');
  console.log('\n📋 Next Steps:');
  console.log('1. If MySQL connection failed, fix the database connection');
  console.log('2. If sales table is missing, run: mysql -u username -p database_name < scripts/mysql_sales_schema.sql');
  console.log('3. Visit http://localhost:3000/test-integration to test the web integration');
  console.log('4. Check the browser console and server logs for any errors');
}

// Run the diagnostic
diagnoseIntegration().catch(console.error);