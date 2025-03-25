import React, { useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Checkbox,
  Typography,
  Collapse,
  Snackbar,
  Alert,
  IconButton,
} from '@mui/material';
import { ArrowForward, ArrowBack, Cancel } from '@mui/icons-material';

const initialRequests = [
    { id: 1, sinNumber: 'S123456', name: 'John Doe', department: 'CSE', status: 'Pending', priority: 'High', date: '2024-10-01', reason: 'Medical Leave', type: 'Leave' },
    { id: 2, sinNumber: 'S123457', name: 'Jane Smith', department: 'ECE', status: 'Pending', priority: 'Medium', date: '2024-10-05', reason: 'Internship', type: 'Internship', pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' }, // No PDF for testing
    { id: 3, sinNumber: 'S123458', name: 'Alice Johnson', department: 'IT', status: 'Pending', priority: 'Low', date: '2024-10-07', reason: 'Family Function', type: 'OD' },
  { id: 4, sinNumber: 'S123459', name: 'Bob Brown', department: 'MECH', status: 'Pending', priority: 'High', date: '2024-10-08', reason: 'Leave Request', type: 'Leave' },
  { id: 5, sinNumber: 'S123460', name: 'Chris Green', department: 'Civil', status: 'Pending', priority: 'Medium', date: '2024-10-10', reason: 'Project Work', type: 'OD' },
  { id: 6, sinNumber: 'S123461', name: 'David King', department: 'Physics', status: 'Pending', priority: 'Low', date: '2024-10-15', reason: 'Internship', type: 'Internship', pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
  { id: 7, sinNumber: 'S123462', name: 'Emma Davis', department: 'Chemistry', status: 'Pending', priority: 'High', date: '2024-10-17', reason: 'Medical Leave', type: 'Leave' },
  { id: 8, sinNumber: 'S123463', name: 'Liam White', department: 'Biology', status: 'Pending', priority: 'Medium', date: '2024-10-20', reason: 'Internship', type: 'Internship', pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
  { id: 9, sinNumber: 'S123464', name: 'Olivia Black', department: 'Maths', status: 'Pending', priority: 'Low', date: '2024-10-22', reason: 'Project Work', type: 'OD' },
  { id: 10, sinNumber: 'S123465', name: 'Noah Blue', department: 'Computer Science', status: 'Pending', priority: 'High', date: '2024-10-24', reason: 'Family Function', type: 'OD' },
];

const PAGE_SIZE = 3; // Show 3 requests at a time

export default function RequestTable() {
  const [rows, setRows] = useState(initialRequests);
  const [selected, setSelected] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', type: '' });
  const [page, setPage] = useState(0); // Track current page for navigation

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = rows.map((row) => row.id);
      setSelected(newSelected);
    } else {
      setSelected([]);
    }
  };

  const handleCheckboxClick = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    const newSelected = selectedIndex === -1 ? [...selected, id] : selected.filter((selectedId) => selectedId !== id);
    setSelected(newSelected);
  };

  const handleAction = (id, action) => {
    const updatedRows = rows.map((row) => (row.id === id ? { ...row, status: action } : row));
    setRows(updatedRows);
    setSelected(selected.filter((selectedId) => selectedId !== id));
    setSnackbar({ open: true, message: `Request ${action}`, type: action === 'Accepted' ? 'success' : 'error' });
  };

  const handleCloseSnackbar = () => setSnackbar({ open: false, message: '', type: '' });

  const renderRowDetails = (row) => (
    <Collapse in={selected.includes(row.id)} timeout="auto" unmountOnExit>
      <Box sx={{ padding: 2, backgroundColor: '#f0f8ff', borderBottom: '1px solid #ddd', marginBottom: 1 }}>
        <Typography><strong>SIN Number:</strong> {row.sinNumber}</Typography>
        <Typography><strong>Name:</strong> {row.name}</Typography>
        <Typography><strong>Department:</strong> {row.department}</Typography>
        <Typography><strong>Reason:</strong> {row.reason}</Typography>
        
        {/* PDF View Button */}
        {row.pdfUrl && (
          <Button
            variant="contained"
            color="primary"
            sx={{ marginTop: 2 }}
            onClick={() => window.open(row.pdfUrl, '_blank')}
          >
            View PDF
          </Button>
        )}
  
        <Box sx={{ display: 'flex', gap: 2, marginTop: 2 }}>
          <Button variant="contained" color="success" onClick={() => handleAction(row.id, 'Accepted')}>Accept</Button>
          <Button variant="contained" color="error" onClick={() => handleAction(row.id, 'Rejected')}>Reject</Button>
        </Box>
      </Box>
    </Collapse>
  );
  

  const currentPageRows = rows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const handleNext = () => {
    if ((page + 1) * PAGE_SIZE < rows.length) {
      setPage(page + 1);
    }
  };

  const handlePrevious = () => {
    if (page > 0) {
      setPage(page - 1);
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', padding: 4 }}>
      <Paper sx={{ width: '100%', maxWidth: '1000px', padding: 4, backgroundColor: '#f9f9f9', borderRadius: 2 }}>
        <Typography variant="h5" align="center" sx={{ marginBottom: 2, color: '#3f51b5' }}>Leave/OD/Internship Requests</Typography>

        <TableContainer sx={{ maxHeight: 400 }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead sx={{ backgroundColor: '#3f51b5', color: 'white' }}>
              <TableRow>
                <TableCell padding="checkbox" sx={{ color: 'white' }}>
                  <Checkbox
                    color="default"
                    indeterminate={selected.length > 0 && selected.length < currentPageRows.length}
                    checked={currentPageRows.length > 0 && selected.length === currentPageRows.length}
                    onChange={handleSelectAllClick}
                  />
                </TableCell>
                <TableCell sx={{ color: 'white' }}><strong>Name</strong></TableCell>
                <TableCell sx={{ color: 'white' }}><strong>Type</strong></TableCell>
                <TableCell sx={{ color: 'white' }} align="right"><strong>Status</strong></TableCell>
                <TableCell sx={{ color: 'white' }} align="right"><strong>Priority</strong></TableCell>
                <TableCell sx={{ color: 'white' }} align="right"><strong>Date</strong></TableCell>
                <TableCell sx={{ color: 'white' }} align="right"><strong>Action</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentPageRows.map((row) => (
                <React.Fragment key={row.id}>
                  <TableRow hover>
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        checked={selected.includes(row.id)}
                        onChange={(event) => handleCheckboxClick(event, row.id)}
                      />
                    </TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.type}</TableCell>
                    <TableCell align="right">{row.status}</TableCell>
                    <TableCell align="right">{row.priority}</TableCell>
                    <TableCell align="right">{row.date}</TableCell>
                    <TableCell align="right">
                      <Button variant="contained" onClick={() => setSelected([row.id])}>View</Button>
                    </TableCell>
                  </TableRow>
                  {renderRowDetails(row)}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
          <IconButton color="primary" onClick={handlePrevious} disabled={page === 0}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6">{`Page ${page + 1}`}</Typography>
          <IconButton color="primary" onClick={handleNext} disabled={(page + 1) * PAGE_SIZE >= rows.length}>
            <ArrowForward />
          </IconButton>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: 3 }}>
</Box>
      </Paper>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.type} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
