import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardHeader, Typography } from '../../mui';

// Sample data - replace with actual data from your API
const data = [
  { month: 'Jan', churnRate: 2.5 },
  { month: 'Feb', churnRate: 2.8 },
  { month: 'Mar', churnRate: 3.1 },
  { month: 'Apr', churnRate: 2.9 },
  { month: 'May', churnRate: 2.7 },
  { month: 'Jun', churnRate: 2.4 },
];

const ChurnChart: React.FC = () => {
  return (
    <Card>
      <CardHeader 
        title="Évolution du Taux de Churn"
        subheader="6 derniers mois"
      />
      <CardContent>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Taux de désabonnement des clients au fil du temps
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="churnRate"
              name="Taux de Churn (%)"
              stroke="#2563eb"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default ChurnChart; 