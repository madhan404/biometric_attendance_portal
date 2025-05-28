// const express = require('express');
// const cors = require('cors');
// const app = express();
// const port = process.env.PORT || 3001;

// // CORS configuration
// app.use(cors({
//   origin: 'http://localhost:5173', // Frontend URL
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   credentials: true
// }));

// app.use(express.json());

// // Log all incoming requests
// app.use((req, res, next) => {
//   console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
//   next();
// });

// // Import routes
// const staffLeaveStsRouter = require('./routes/staff_leave_sts');
// // ... other route imports ...

// // Register routes
// app.use('/api/staff', staffLeaveStsRouter);
// // ... other route registrations ...

// // Error handling middleware
// app.use((err, req, res, next) => {
//   console.error('Global error handler:', err);
//   res.status(err.status || 500).json({
//     error: err.message || 'Internal Server Error',
//     stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
//   });
// });

// // 404 handler
// app.use((req, res) => {
//   console.log('404 Not Found:', req.method, req.url);
//   res.status(404).json({ error: 'Not Found' });
// });

// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
//   console.log('Available routes:');
//   console.log('- POST /api/staff/staff-leave-sts');
//   // ... log other routes ...
// }); 