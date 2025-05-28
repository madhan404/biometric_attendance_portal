// import React from 'react';
// import { Box, Tabs, Tab, Typography } from '@mui/material';
// import { useLocation, useNavigate } from 'react-router-dom';
// import NonClassAdvisorDashboard from '../Navigation/Non_ClassAdvisorDashboard';
// import MentorDashboard from '../Navigation/MentorDashboard';
// import StaffDashboard from '../Navigation/StaffDashboard';

// const StaffDashboardLayout = () => {
//   const [value, setValue] = React.useState(0);
//   const location = useLocation();
//   const navigate = useNavigate();
//   const { isMentor, isClassAdvisor } = location.state || {};

//   const handleChange = (event, newValue) => {
//     setValue(newValue);
//   };

//   // Get user role information from session storage
//   const user = JSON.parse(sessionStorage.getItem('user') || '{}');
//   const position1 = user.position_1;
//   const position2 = user.position_2;

//   // Determine which tabs to show based on user positions
//   const showMentorTab = position1 === 'mentor';
//   const showClassAdvisorTab = position2 === 'class_advisor';

//   return (
//     <Box sx={{ width: '100%' }}>
//       <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
//         <Tabs 
//           value={value} 
//           onChange={handleChange}
//           variant="scrollable"
//           scrollButtons="auto"
//           allowScrollButtonsMobile
//         >
//           <Tab label="Staff Dashboard" />
//           {showMentorTab && <Tab label="Mentor Dashboard" />}
//           {showClassAdvisorTab && <Tab label="Class Advisor Dashboard" />}
//         </Tabs>
//       </Box>
//       <Box sx={{ p: 3 }}>
//         {value === 0 && <NonClassAdvisorDashboard />}
//         {value === 1 && showMentorTab && <MentorDashboard />}
//         {value === 2 && showClassAdvisorTab && <StaffDashboard />}
//       </Box>
//     </Box>
//   );
// };

// export default StaffDashboardLayout;