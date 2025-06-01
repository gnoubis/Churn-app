import React from 'react';
import { Grid as MuiGrid, GridProps } from '@mui/material';
import { Theme } from '@mui/material/styles';
import { SxProps } from '@mui/system';
import { ElementType } from 'react';

type ResponsiveValue = number | 'auto' | boolean;

interface CustomGridProps extends GridProps {
  component?: ElementType;
  children: React.ReactNode;
  container?: boolean;
  item?: boolean;
  xs?: ResponsiveValue;
  sm?: ResponsiveValue;
  md?: ResponsiveValue;
  lg?: ResponsiveValue;
  xl?: ResponsiveValue;
  spacing?: number | string;
  direction?: 'row' | 'row-reverse' | 'column' | 'column-reverse';
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
  alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline';
  sx?: SxProps<Theme>;
}

const Grid = (props: CustomGridProps) => {
  const { component, children, ...rest } = props;
  return (
    <MuiGrid component={component || 'div'} {...rest}>
      {children}
    </MuiGrid>
  );
};

export default Grid; 