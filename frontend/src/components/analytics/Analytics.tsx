import React from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  CardHeader,
} from '../../mui';
import ChurnChart from './ChurnChart';
import GridItem from '../common/GridItem';

const Analytics: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Analytics
      </Typography>
      <Grid container spacing={3}>
        <GridItem xs={12} md={6}>
          <ChurnChart />
        </GridItem>
        <GridItem xs={12} md={6}>
          <Card>
            <CardHeader title="Prédictions" />
            <CardContent>
              <Typography variant="body1">
                Prédictions et tendances à venir...
              </Typography>
            </CardContent>
          </Card>
        </GridItem>
      </Grid>
    </Box>
  );
};

export default Analytics; 