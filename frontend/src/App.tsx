import React, { useState, useEffect } from 'react';
import { backend } from 'declarations/backend';
import { Container, Typography, TextField, Button, Slider, Box, CircularProgress, List, ListItem, ListItemText, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface Person {
  id: number;
  name: string;
  percentage: number;
  amount: number;
}

const App: React.FC = () => {
  const [billTotal, setBillTotal] = useState<number>(0);
  const [people, setPeople] = useState<Person[]>([]);
  const [newPersonName, setNewPersonName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [remaining, setRemaining] = useState<number>(100);

  useEffect(() => {
    fetchBillSplit();
  }, []);

  const fetchBillSplit = async () => {
    setLoading(true);
    try {
      const result = await backend.getBillSplit();
      if (result) {
        setBillTotal(Number(result.total));
        setPeople(result.people.map(p => ({
          id: Number(p[0]),
          name: p[1],
          percentage: Number(p[2]),
          amount: Number(p[3])
        })));
        setRemaining(Number(result.remaining));
      }
    } catch (error) {
      console.error('Error fetching bill split:', error);
    }
    setLoading(false);
  };

  const handleSetBillTotal = async () => {
    setLoading(true);
    try {
      await backend.setBillTotal(billTotal);
      await fetchBillSplit();
    } catch (error) {
      console.error('Error setting bill total:', error);
    }
    setLoading(false);
  };

  const handleAddPerson = async () => {
    if (newPersonName.trim() === '') return;
    setLoading(true);
    try {
      await backend.addPerson(newPersonName);
      setNewPersonName('');
      await fetchBillSplit();
    } catch (error) {
      console.error('Error adding person:', error);
    }
    setLoading(false);
  };

  const handleRemovePerson = async (id: number) => {
    setLoading(true);
    try {
      await backend.removePerson(id);
      await fetchBillSplit();
    } catch (error) {
      console.error('Error removing person:', error);
    }
    setLoading(false);
  };

  const handleUpdatePercentage = async (id: number, percentage: number) => {
    setLoading(true);
    try {
      await backend.updatePercentage(id, percentage);
      await fetchBillSplit();
    } catch (error) {
      console.error('Error updating percentage:', error);
    }
    setLoading(false);
  };

  const chartData = {
    labels: people.map(p => p.name),
    datasets: [
      {
        data: people.map(p => p.percentage),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40'
        ]
      }
    ]
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h2" component="h1" gutterBottom>
        Bill Splitting App
      </Typography>
      <Box mb={4}>
        <TextField
          label="Total Bill Amount"
          type="number"
          value={billTotal}
          onChange={(e) => setBillTotal(Number(e.target.value))}
          fullWidth
          margin="normal"
        />
        <Button variant="contained" color="primary" onClick={handleSetBillTotal}>
          Set Bill Total
        </Button>
      </Box>
      <Box mb={4}>
        <TextField
          label="New Person Name"
          value={newPersonName}
          onChange={(e) => setNewPersonName(e.target.value)}
          fullWidth
          margin="normal"
        />
        <Button variant="contained" color="secondary" onClick={handleAddPerson}>
          Add Person
        </Button>
      </Box>
      <List>
        {people.map((person) => (
          <ListItem key={person.id}>
            <ListItemText
              primary={person.name}
              secondary={`${person.percentage.toFixed(2)}% - $${person.amount.toFixed(2)}`}
            />
            <Slider
              value={person.percentage}
              onChange={(_, value) => handleUpdatePercentage(person.id, Number(value))}
              min={0}
              max={100}
              step={0.1}
              valueLabelDisplay="auto"
              style={{ width: '200px', marginRight: '20px' }}
            />
            <IconButton edge="end" aria-label="delete" onClick={() => handleRemovePerson(person.id)}>
              <DeleteIcon />
            </IconButton>
          </ListItem>
        ))}
      </List>
      <Box mb={4}>
        <Typography variant="h6" gutterBottom>
          Remaining: {remaining.toFixed(2)}%
        </Typography>
      </Box>
      <Box mb={4} style={{ height: '300px' }}>
        <Pie data={chartData} options={{ maintainAspectRatio: false }} />
      </Box>
      {loading && (
        <Box display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      )}
    </Container>
  );
};

export default App;
