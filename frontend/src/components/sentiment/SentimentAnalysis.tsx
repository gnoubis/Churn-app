import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Chip,
} from '@mui/material';
import GridItem from '../common/GridItem';

const SentimentAnalysis: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Analyse des Sentiments
      </Typography>
      <Grid container spacing={3}>
        <GridItem xs={12} md={6}>
          <Card>
            <CardHeader 
              title="Tendances Générales" 
              subheader="Répartition des sentiments"
            />
            <CardContent>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Chip label="Positif (45%)" color="success" />
                <Chip label="Neutre (30%)" color="default" />
                <Chip label="Négatif (25%)" color="error" />
              </Box>
              <Typography variant="body1">
                Visualisation des tendances à venir...
              </Typography>
            </CardContent>
          </Card>
        </GridItem>
        <GridItem xs={12} md={6}>
          <Card>
            <CardHeader 
              title="Analyse Détaillée" 
              subheader="Par source de données"
            />
            <CardContent>
              <Typography variant="body1">
                Analyses détaillées des sentiments à venir...
              </Typography>
            </CardContent>
          </Card>
        </GridItem>
      </Grid>
    </Box>
  );
};

export default SentimentAnalysis; 