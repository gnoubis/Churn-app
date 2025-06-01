import React from 'react';
import { Container, Grid } from '@mui/material';
import ChurnChart from '../components/dashboard/ChurnChart';

const Dashboard: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Grid container spacing={3} sx={{ m: 0, width: '100%' }}>
        <Grid component="div" item xs={12}>
          <ChurnChart />
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard; 