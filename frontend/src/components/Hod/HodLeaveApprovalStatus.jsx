
import React from "react";
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
  Button,
  Box,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/HourglassTop";
import CancelIcon from "@mui/icons-material/Cancel";
import { useNavigate } from "react-router-dom"; 

const requests = [
  {
    id: 1,
    type: "Leave ",
    date: "2024-10-01",
    stages: [
      { stage: "Principal", status: "Approved" },
    ],
  },
  {
    id: 2,
    type: "Leave ",
    date: "2024-10-02",
    stages: [
      { stage: "Principal", status: "Pending" },
    ],
  },

  {
    id: 4,
    type: "OD ",
    date: "2024-10-07",
    stages: [
      { stage: "Principal", status: "Pending" },
    ],
  }
];

// Icon based on status
const getStatusIcon = (status) => {
  switch (status) {
    case "Approved":
      return <CheckCircleIcon color="success" />;
    case "Pending":
      return <PendingIcon color="warning" />;
    case "Rejected":
      return <CancelIcon color="error" />;
    default:
      return null;
  }
};

// Chip color based on status
const getStatusColor = (status) => {
  switch (status) {
    case "Approved":
      return "success";
    case "Pending":
      return "warning";
    case "Rejected":
      return "error";
    default:
      return "default";
  }
};

const LeaveApprovalStatus = () => {
  const navigate = useNavigate(); // Initialize useNavigate

  return (
    <Paper
      elevation={4}
      sx={{
        p: 4,
        maxWidth: 1000,
        margin: "auto",
        background: "linear-gradient(135deg, #fbc2eb, #a6c1ee)",
        borderRadius: 3,
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
      }}
    >
      <Typography
        variant="h4"
        align="center"
        color="#007bff"
        gutterBottom
        sx={{ fontWeight: "bold", mb: 4 }}
      >
        Request Approval Tracking
      </Typography>

      {requests.map((request) => (
        <Card
          key={request.id}
          sx={{
            mb: 4,
            borderRadius: 2,
            backgroundColor: "#ffffff",
            boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.15)",
            "&:hover": {
              transform: "scale(1.02)",
              transition: "transform 0.2s ease-in-out",
            },
          }}
        >
          <CardContent>
            <Typography
              variant="h6"
              color="#555"
              sx={{ fontWeight: "bold", mb: 2 }}
            >
              {request.type} - Request Date: {request.date}
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Stepper
              alternativeLabel
              sx={{ mt: 2 }}
              activeStep={
                request.stages.findIndex(
                  (stage) =>
                    stage.status === "Pending" || stage.status === "Rejected"
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
                        variant="filled"
                        size="small"
                        sx={{
                          fontWeight: "bold",
                          fontSize: "0.75rem",
                          mt: 1,
                          px: 1.5,
                          backgroundColor:
                            stage.status === "Approved"
                              ? "#d0f0c0"
                              : stage.status === "Pending"
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
                          stage.status === "Approved"
                            ? "#388e3c"
                            : stage.status === "Pending"
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
      ))}
    </Paper>
  );
};

export default LeaveApprovalStatus;
