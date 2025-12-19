# MySQL Sales Database Integration Guide

This guide will help you integrate your MySQL sales database with the pharmacy web application and fix real-time updates.

## 🚀 Quick Setup

### 1. Database Setup

1. **Run the MySQL schema script:**
   ```sql
   mysql -u your_username -p your_database_name < scripts/mysql_sales_schema.sql
   ```

2. **Or manually create the database:**
   - Import `scripts/mysql_sales_schema.sql` into your MySQL database
   - This creates tables: `medicines`, `sales`, `customers`, `sales_items`, `daily_sales_summary`

### 2. Environment Configuration

1. **Create `.env.local` file in the project root:**
   ```env
   # Supabase Configuration (for medicines, alerts, etc.)
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

   # MySQL Configuration (for sales data)
   MYSQL_HOST=your_mysql_host
   MYSQL_PORT=3306
   MYSQL_USER=your_mysql_username
   MYSQL_PASSWORD=your_mysql_password
   MYSQL_DATABASE=your_mysql_database_name
   ```

2. **Replace with your actual MySQL credentials**

### 3. Install Dependencies

```bash
npm install mysql2
```

### 4. Test the Integration

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Test the API endpoints:**
   - `GET /api/sales` - Fetch sales data
   - `GET /api/sales/stats?period=today` - Get sales statistics
   - `POST /api/sales` - Create new sale

## 📊 API Endpoints

### Sales Data
- **GET** `/api/sales?startDate=2024-01-01&endDate=2024-12-31&limit=100`
- **POST** `/api/sales` - Create new sale

### Sales Statistics
- **GET** `/api/sales/stats?period=today|week|month|year`

## 🔄 Real-time Updates

The integration includes several methods for real-time updates:

### 1. Polling (Default)
- Dashboards poll MySQL every 30 seconds
- Reports refresh every 60 seconds
- Configurable intervals

### 2. Manual Refresh
- Use the `refetch()` function from hooks
- Trigger updates on user actions

### 3. Custom Hooks

```typescript
import { useMySQLSales, useMySQLSalesStats } from '@/hooks/use-mysql-sales'

// In your component
const { sales, loading, error, refetch } = useMySQLSales()
const { stats, loading: statsLoading } = useMySQLSalesStats('today')
```

## 🏗️ Database Schema

### Sales Table Structure
```sql
CREATE TABLE sales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    medicine_id INT,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payment_method ENUM('cash', 'card', 'upi', 'online', 'insurance'),
    customer_name VARCHAR(255),
    customer_phone VARCHAR(20),
    customer_email VARCHAR(255),
    prescription_id VARCHAR(100),
    user_id VARCHAR(255),
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    notes TEXT,
    status ENUM('completed', 'pending', 'cancelled', 'refunded'),
    -- ... other fields
);
```

## 🔧 Troubleshooting

### Common Issues

1. **Connection Errors**
   - Check MySQL credentials in `.env.local`
   - Ensure MySQL server is running
   - Verify network connectivity

2. **Real-time Updates Not Working**
   - Check browser console for errors
   - Verify API endpoints are responding
   - Ensure polling intervals are set correctly

3. **Data Not Syncing**
   - Check database table structure matches schema
   - Verify foreign key relationships
   - Check for SQL syntax errors

### Debug Steps

1. **Test MySQL connection:**
   ```bash
   mysql -h your_host -u your_user -p your_database
   ```

2. **Check API responses:**
   ```bash
   curl http://localhost:3000/api/sales/stats?period=today
   ```

3. **Monitor logs:**
   - Check browser console
   - Check server logs in terminal

## 📈 Performance Optimization

### 1. Database Indexes
The schema includes optimized indexes for:
- Sale date queries
- Customer lookups
- Payment method filtering
- Medicine relationships

### 2. Connection Pooling
- MySQL connection pool configured for 10 concurrent connections
- Automatic connection management
- Timeout handling

### 3. Caching Strategy
- Consider implementing Redis for frequently accessed data
- Use React Query for client-side caching
- Implement database query result caching

## 🔐 Security Considerations

1. **Environment Variables**
   - Never commit `.env.local` to version control
   - Use strong database passwords
   - Limit database user permissions

2. **SQL Injection Prevention**
   - All queries use parameterized statements
   - Input validation on API endpoints
   - Proper error handling

3. **Access Control**
   - Implement proper authentication
   - Role-based access control
   - API rate limiting

## 🚀 Deployment

### Production Environment

1. **Set environment variables in your hosting platform**
2. **Ensure MySQL database is accessible**
3. **Configure connection pooling for production load**
4. **Set up monitoring and logging**

### Vercel Deployment
```bash
# Set environment variables
vercel env add MYSQL_HOST
vercel env add MYSQL_USER
vercel env add MYSQL_PASSWORD
vercel env add MYSQL_DATABASE

# Deploy
vercel --prod
```

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Verify your database schema matches the provided structure
3. Test API endpoints individually
4. Check environment variable configuration

The integration provides a robust foundation for MySQL sales data with real-time updates through polling and manual refresh capabilities.