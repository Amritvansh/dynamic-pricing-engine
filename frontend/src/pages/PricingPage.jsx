import React, { useState } from 'react';
import { Box, Grid, Card, CardContent, Typography, Button, TextField, MenuItem, Slider, Chip } from '@mui/material';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import PageHeader from '../components/common/PageHeader';

const PricingPage = () => {
  const [demandScore, setDemandScore] = useState(50);
  
  const getDemandLevel = (score) => {
    if (score >= 70) return { label: 'HIGH', color: 'success' };
    if (score >= 40) return { label: 'MEDIUM', color: 'warning' };
    return { label: 'LOW', color: 'error' };
  };

  const demandLevel = getDemandLevel(demandScore);

  return (
    <Box>
      <PageHeader 
        title="Pricing Recommendation Engine" 
        breadcrumbs={[{ label: 'Pricing Engine', path: '/pricing' }]}
      />
      
      <Grid container spacing={4}>
        {/* Input Form Panel */}
        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Calculate Price</Typography>
              
              <Box sx={{ mt: 3 }}>
                <TextField
                  select
                  fullWidth
                  label="Select Product"
                  defaultValue=""
                  sx={{ mb: 4 }}
                >
                  <MenuItem value=""><em>None</em></MenuItem>
                </TextField>

                <Box sx={{ mb: 4 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography gutterBottom>Demand Score</Typography>
                    <Chip 
                      label={demandLevel.label} 
                      color={demandLevel.color} 
                      size="small" 
                      sx={{ fontWeight: 'bold' }}
                    />
                  </Box>
                  <Slider
                    value={demandScore}
                    onChange={(e, val) => setDemandScore(val)}
                    valueLabelDisplay="auto"
                    step={1}
                    marks={[
                      { value: 0, label: '0' },
                      { value: 50, label: '50' },
                      { value: 100, label: '100' }
                    ]}
                    min={0}
                    max={100}
                  />
                  <Typography variant="caption" color="textSecondary">
                    0-39: Low | 40-69: Medium | 70-100: High
                  </Typography>
                </Box>

                <Button 
                  variant="contained" 
                  fullWidth 
                  size="large"
                  startIcon={<AutoFixHighIcon />}
                >
                  Calculate Recommended Price
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Result Panel */}
        <Grid item xs={12} md={7}>
          <Card sx={{ height: '100%', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <AutoFixHighIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="textSecondary">
                Select a product and calculate to view recommendations
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PricingPage;
