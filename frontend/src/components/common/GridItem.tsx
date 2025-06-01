import React, { ElementType } from 'react';
import { Grid } from '../../mui-exports';

interface GridItemProps {
  component?: ElementType;
  children: React.ReactNode;
  [key: string]: any;
}

const GridItem: React.FC<GridItemProps> = ({ component = 'div', children, ...props }) => (
  <Grid item component={component} {...props}>
    {children}
  </Grid>
);

export default GridItem; 