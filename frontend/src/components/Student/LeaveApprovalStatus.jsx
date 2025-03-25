// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import {
//   Paper,
//   Typography,
//   Card,
//   CardContent,
//   Divider,
//   Chip,
//   Stepper,
//   Step,
//   StepLabel,
// } from "@mui/material";
// import CheckCircleIcon from "@mui/icons-material/CheckCircle";
// import PendingIcon from "@mui/icons-material/HourglassTop";
// import CancelIcon from "@mui/icons-material/Cancel";

// // Icon based on status
// const getStatusIcon = (status) => {
//   switch (status.toLowerCase()) {
//     case "approved":
//       return <CheckCircleIcon color="success" />;
//     case "pending":
//       return <PendingIcon color="warning" />;
//     case "rejected":
//       return <CancelIcon color="error" />;
//     default:
//       return null;
//   }
// };

// // Chip color based on status
// const getStatusColor = (status) => {
//   switch (status.toLowerCase()) {
//     case "approved":
//       return "success";
//     case "pending":
//       return "warning";
//     case "rejected":
//       return "error";
//     default:
//       return "default";
//   }
// };

// const LeaveApprovalStatus = () => {
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [request, setRequest] = useState(null);
//   const [user, setUser] = useState(null);

//   useEffect(() => {
//     // Fetch user data from session storage
//     const storedUser = sessionStorage.getItem("user");
//     if (storedUser) {
//       setUser(JSON.parse(storedUser));
//     }
//   }, []);

//   useEffect(() => {
//     const fetchApprovalStatus = async () => {
//       if (!user?.sin_number) return; // Ensure user data is available

//       try {
//         setLoading(true);
//         const response = await axios.post(
//           "http://localhost:3001/api/stdleavests/leavests",
//           { sin_number: user.sin_number }
//         );

//         const { data } = response;
//         if (data.status === 200) {
//           const stages = [
//             { stage: "Class Advisor", status: data.class_advisor_approval },
//             { stage: "HoD", status: data.hod_approval },
//             { stage: "Principal", status: data.principal_approval },
//             ...(data.placement_officer_approval
//               ? [
//                   {
//                     stage: "Placement Officer",
//                     status: data.placement_officer_approval,
//                   },
//                 ]
//               : []),
//           ];
//           setRequest({
//             request_id: data.request_id, // Add request_id to state
//             type: "Leave",
//             date: new Date().toLocaleDateString(),
//             stages,
//             pdf_data: data.pdf_data,
//           });
//         } else {
//           setError(data.message || "Failed to fetch leave status.");
//         }
//       } catch (err) {
//         setError(err.message || "Error fetching leave status.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchApprovalStatus();
//   }, [user?.sin_number]);

//   if (loading) {
//     return (
//       <Typography variant="h6" align="center" sx={{ mt: 4 }}>
//         Loading leave approval status...
//       </Typography>
//     );
//   }

//   if (error) {
//     return (
//       <Typography variant="h6" align="center" color="error" sx={{ mt: 4 }}>
//         {error}
//       </Typography>
//     );
//   }

//   if (!request) {
//     return (
//       <Typography variant="h6" align="center" sx={{ mt: 4 }}>
//         No leave request found.
//       </Typography>
//     );
//   }

//   return (
//     <Paper
//       elevation={4}
//       sx={{
//         p: 4,
//         maxWidth: 1000,
//         margin: "auto",
//         background: "linear-gradient(135deg, #f5f7fa, #c3cfe2)",
//         borderRadius: 3,
//         boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.1)",
//       }}
//     >
//       <Typography
//         variant="h4"
//         align="center"
//         gutterBottom
//         sx={{ fontWeight: "bold", color: "#2c3e50", mb: 4 }}
//       >
//         Request Approval Tracking
//       </Typography>

//       <Card
//         sx={{
//           mb: 4,
//           borderRadius: 2,
//           backgroundColor: "#ffffff",
//           boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.1)",
//           "&:hover": {
//             transform: "scale(1.02)",
//             transition: "transform 0.2s ease-in-out",
//           },
//         }}
//       >
//         <CardContent>
//           <Typography
//             variant="h6"
//             sx={{ fontWeight: "bold", color: "#34495e", mb: 2 }}
//           >
//             {request.type} - Request ID: {request.request_id}
//           </Typography>
//           <Typography variant="subtitle1" sx={{ color: "#7f8c8d", mb: 2 }}>
//             Request Date: {request.date}
//           </Typography>
//           <Divider sx={{ mb: 2 }} />

//           <Stepper
//             alternativeLabel
//             sx={{ mt: 2 }}
//             activeStep={
//               request.stages.findIndex(
//                 (stage) =>
//                   stage.status.toLowerCase() === "pending" ||
//                   stage.status.toLowerCase() === "rejected"
//               ) + 1
//             }
//           >
//             {request.stages.map((stage, index) => (
//               <Step key={index}>
//                 <StepLabel
//                   icon={getStatusIcon(stage.status)}
//                   optional={
//                     <Chip
//                       label={stage.status}
//                       color={getStatusColor(stage.status)}
//                       size="small"
//                       sx={{
//                         fontWeight: "bold",
//                         fontSize: "0.75rem",
//                         mt: 1,
//                         px: 1.5,
//                         backgroundColor:
//                           stage.status.toLowerCase() === "approved"
//                             ? "#d0f0c0"
//                             : stage.status.toLowerCase() === "pending"
//                             ? "#ffe082"
//                             : "#ff8a80",
//                         color: "#333",
//                       }}
//                     />
//                   }
//                 >
//                   <Typography
//                     variant="subtitle2"
//                     sx={{
//                       fontWeight: "bold",
//                       color:
//                         stage.status.toLowerCase() === "approved"
//                           ? "#388e3c"
//                           : stage.status.toLowerCase() === "pending"
//                           ? "#f57c00"
//                           : "#d32f2f",
//                     }}
//                   >
//                     {stage.stage}
//                   </Typography>
//                 </StepLabel>
//               </Step>
//             ))}
//           </Stepper>
//         </CardContent>
//       </Card>

//       {request.pdf_data && (
//         <iframe
//           src={`data:application/pdf;base64,${request.pdf_data}`}
//           width="100%"
//           height="500px"
//           title="Leave Request PDF"
//           style={{ border: "none", borderRadius: "8px", boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.1)" }}
//         />
//       )}
//     </Paper>
//   );
// };

// export default LeaveApprovalStatus;

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Paper,
  Typography,
  Card,
  CardContent,
  Divider,
  Chip,
  Stepper,
  Step,
  StepLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/HourglassTop";
import CancelIcon from "@mui/icons-material/Cancel";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

// Icon based on status
const getStatusIcon = (status) => {
  switch (status.toLowerCase()) {
    case "approved":
      return <CheckCircleIcon color="success" />;
    case "pending":
      return <PendingIcon color="warning" />;
    case "rejected":
      return <CancelIcon color="error" />;
    default:
      return null;
  }
};

// Chip color based on status
const getStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case "approved":
      return "success";
    case "pending":
      return "warning";
    case "rejected":
      return "error";
    default:
      return "default";
  }
};

const LeaveApprovalStatus = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Fetch user data from session storage
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    const fetchApprovalStatus = async () => {
      if (!user?.sin_number) return; // Ensure user data is available

      try {
        setLoading(true);
        const response = await axios.post(
          "http://localhost:3001/api/stdleavests/leavests",
          { sin_number: user.sin_number }
        );

        const { data } = response;
        if (Array.isArray(data)) {
          // Map each leave request to include stages
          const formattedRequests = data.map((request) => {
            const stages = [
              { stage: "Class Advisor", status: request.class_advisor_approval || "pending" },
              { stage: "HoD", status: request.hod_approval || "pending" },
              { stage: "Principal", status: request.principal_approval || "pending" },
              ...(request.request_type === "internship"
                ? [
                    {
                      stage: "Placement Officer",
                      status: request.placement_officer_approval || "pending",
                    },
                  ]
                : []),
            ];
            return {
              ...request,
              stages,
            };
          });

          setLeaveRequests(formattedRequests);
        } else {
          setError("Failed to fetch leave status.");
        }
      } catch (err) {
        setError(err.message || "Error fetching leave status.");
      } finally {
        setLoading(false);
      }
    };

    fetchApprovalStatus();
  }, [user?.sin_number]);

  if (loading) {
    return (
      <Typography variant="h6" align="center" sx={{ mt: 4 }}>
        Loading leave approval status...
      </Typography>
    );
  }

  if (error) {
    return (
      <Typography variant="h6" align="center" color="error" sx={{ mt: 4 }}>
        {error}
      </Typography>
    );
  }

  if (leaveRequests.length === 0) {
    return (
      <Typography variant="h6" align="center" sx={{ mt: 4 }}>
        No leave requests found.
      </Typography>
    );
  }

  return (
    <Paper
      elevation={4}
      sx={{
        p: 4,
        maxWidth: 1000,
        margin: "auto",
        background: "linear-gradient(135deg, #f5f7fa, #c3cfe2)",
        borderRadius: 3,
        boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Typography
        variant="h4"
        align="center"
        gutterBottom
        sx={{ fontWeight: "bold", color: "#2c3e50", mb: 4 }}
      >
        Request Approval Tracking
      </Typography>

      {leaveRequests.map((request, index) => (
        <Accordion key={index} sx={{ mb: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              {request.request_type} - Request ID: {request.request_id}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle1" sx={{ color: "#7f8c8d", mb: 2 }}>
                  Request Date: {new Date().toLocaleDateString()}
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Stepper
                  alternativeLabel
                  sx={{ mt: 2 }}
                  activeStep={
                    request.stages.findIndex(
                      (stage) =>
                        stage.status.toLowerCase() === "pending" ||
                        stage.status.toLowerCase() === "rejected"
                    ) + 1
                  }
                >
                  {request.stages.map((stage, index) => (
                    <Step key={index}>
                      <StepLabel
                        icon={getStatusIcon(stage.status)}
                        optional={
                          <Chip
                            label={stage.status}
                            color={getStatusColor(stage.status)}
                            size="small"
                            sx={{
                              fontWeight: "bold",
                              fontSize: "0.75rem",
                              mt: 1,
                              px: 1.5,
                              backgroundColor:
                                stage.status.toLowerCase() === "approved"
                                  ? "#d0f0c0"
                                  : stage.status.toLowerCase() === "pending"
                                  ? "#ffe082"
                                  : "#ff8a80",
                              color: "#333",
                            }}
                          />
                        }
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: "bold",
                            color:
                              stage.status.toLowerCase() === "approved"
                                ? "#388e3c"
                                : stage.status.toLowerCase() === "pending"
                                ? "#f57c00"
                                : "#d32f2f",
                          }}
                        >
                          {stage.stage}
                        </Typography>
                      </StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </CardContent>
            </Card>

            {request.pdf_data && (
              <iframe
                src={`data:application/pdf;base64,${request.pdf_data}`}
                width="100%"
                height="500px"
                title="Leave Request PDF"
                style={{ border: "none", borderRadius: "8px", boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.1)" }}
              />
            )}
          </AccordionDetails>
        </Accordion>
      ))}
    </Paper>
  );
};

export default LeaveApprovalStatus;