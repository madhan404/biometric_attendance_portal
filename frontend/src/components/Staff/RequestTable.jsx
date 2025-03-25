import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Group,
  Select,
  Text,
  Title,
  Notification,
  Modal,
  Textarea,
} from "@mantine/core";
import { IconCheck, IconX } from "@tabler/icons-react";
import { MantineReactTable } from "mantine-react-table";

export default function RequestTable() {
  const [rows, setRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    type: "",
  });
  const [requestType, setRequestType] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [actionType, setActionType] = useState("");

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post(
          "http://localhost:3001/api/leavereq/studentsleaverequests",
          { stdreq: "e21cs024" }
        );
        setRows(response.data.responsedata.stdreq || []); // Ensure it's an array
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  // Filter rows based on request type
  useEffect(() => {
    if (requestType) {
      setFilteredRows(rows.filter((row) => row.request_type === requestType));
    } else {
      setFilteredRows(rows); // Show all rows if no filter is applied
    }
  }, [rows, requestType]);

  const formatDate = (date) => {
    if (!date) return "N/A"; // Handle null or undefined dates
    return new Date(date).toLocaleDateString();
  };

  const handleOpenDialog = (type) => {
    setActionType(type);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setComment("");
  };

  const handleAction = () => {
    const updatedRows = rows.map((row) =>
      selectedRequest[row.request_id] ? { ...row, status: actionType } : row
    );
    setRows(updatedRows);
    setSelectedRequest({});
    setSnackbar({
      open: true,
      message: `Requests ${actionType}`,
      type: actionType === "Approved" ? "success" : "error",
    });
    handleCloseDialog();
    
  };

  const handleCloseSnackbar = () =>
    setSnackbar({ open: false, message: "", type: "" });

  const columns = [
    { accessorKey: "student_name", header: "Name" },
    { accessorKey: "department", header: "Department" },
    { accessorKey: "reason", header: "Reason" },
    {
      accessorKey: "startDate",
      header: "Start Date",
      Cell: ({ cell }) => formatDate(cell.getValue()),
    },
    {
      accessorKey: "endDate",
      header: "End Date",
      Cell: ({ cell }) => formatDate(cell.getValue()),
    },
  ];

  const selectedIds = Object.keys(selectedRequest);

  return (
    <Box sx={{ padding: "2rem", maxWidth: "95%", margin: "0 auto" }}>
      <Title align="center" order={3} mb="lg">
        Leave/OD/Internship Requests
      </Title>

      <Select
        label="Filter by Request Type"
        placeholder="Select a type"
        data={[
          { value: "od", label: "OD" },
          { value: "casual_leave", label: "Casual Leave" },
          { value: "internship", label: "Internship" },
        ]}
        value={requestType}
        onChange={setRequestType}
        mb="lg"
      />

      <MantineReactTable
        columns={columns}
        data={filteredRows}
        enableRowSelection={true}
        getRowId={(row) => row.request_id}
        state={{ rowSelection: selectedRequest }}
        onRowSelectionChange={setSelectedRequest}
      />

      {selectedIds.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <Button
            color="green"
            onClick={() => handleOpenDialog("Approved")}
            style={{ marginRight: 8 }}
          >
            Approve
          </Button>
          <Button color="red" onClick={() => handleOpenDialog("Rejected")}>
            Reject
          </Button>

          <Modal
            opened={dialogOpen}
            onClose={handleCloseDialog}
            title={`Add a comment for ${actionType}`}
          >
            <Textarea
              placeholder="Enter your comment"
              label="Comment"
              withAsterisk
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <Group position="right" mt="md">
              <Button variant="default" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button
                onClick={handleAction}
                color={actionType === "Approved" ? "green" : "red"}
              >
                Submit
              </Button>
            </Group>
          </Modal>
        </div>
      )}

      {snackbar.open && (
        <Notification
          onClose={handleCloseSnackbar}
          icon={
            snackbar.type === "success" ? (
              <IconCheck size={16} />
            ) : (
              <IconX size={16} />
            )
          }
          color={snackbar.type === "success" ? "green" : "red"}
          mt="md"
        >
          {snackbar.message}
        </Notification>
      )}
    </Box>
  );
}
