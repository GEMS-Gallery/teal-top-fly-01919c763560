import React, { useState, useEffect } from 'react';
import { backend } from 'declarations/backend';
import { Container, Typography, TextField, Button, Slider, Box, CircularProgress, List, ListItem, ListItemText, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

interface Person {
  id: number;
  percentage: number;
  amount: number;
}

const App: React.FC = () => {
  const [billTotal, setBillTotal] = useState<number>(0);
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

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
          percentage: Number(p[1]),
          amount: Number(p[2])
        })));
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
    setLoading(true);
    try {
      await backend.addPerson();
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
    try {
      await backend.updatePercentage(id, percentage);
      await fetchBillSplit();
    } catch (error) {
      console.error('Error updating percentage:', error);
    }
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
        <Typography variant="h6" gutterBottom>
          Number of People: {people.length}
        </Typography>
        <Button variant="contained" color="secondary" onClick={handleAddPerson} startIcon={<AddIcon />}>
          Add Person
        </Button>
      </Box>
      <List>
        {people.map((person, index) => (
          <ListItem key={person.id}>
            <ListItemText
              primary={`Person ${index + 1}`}
              secondary={`${person.percentage.toFixed(2)}% - $${person.amount.toFixed(2)}`}
            />
            <Slider
              value={person.percentage}
              onChange={(_, value) => handleUpdatePercentage(person.id, Number(value))}
              min={0}
              max={100}
              step={1}
              valueLabelDisplay="auto"
              style={{ width: '200px', marginRight: '20px' }}
            />
            <IconButton edge="end" aria-label="delete" onClick={() => handleRemovePerson(person.id)}>
              <RemoveIcon />
            </IconButton>
          </ListItem>
        ))}
      </List>
      {loading && (
        <Box display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      )}
    </Container>
  );
};

export default App;
