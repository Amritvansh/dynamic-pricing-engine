import React from "react";
import { Box, Grid, Typography, Card, CardContent } from "@mui/material";
import PageHeader from "../components/common/PageHeader";
import StatCard from "../components/common/StatCard";
import InventoryIcon from "@mui/icons-material/Inventory";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import EmptyState from "../components/common/EmptyState";

const DashboardPage = () => {
  return (
    <Box>
      <PageHeader title="Dashboard" />

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Products"
            value="12"
            icon={<InventoryIcon />}
            color="primary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Low Stock Items"
            value="3"
            icon={<WarningAmberIcon />}
            color="error.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Avg Price Change"
            value="+8.5%"
            icon={<TrendingUpIcon />}
            color="success.main"
            trend={{ value: "↑", label: "vs last week", isPositive: true }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="AI Recs Today"
            value="5"
            icon={<AutoAwesomeIcon />}
            color="secondary.main"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Price Recommendations
              </Typography>
              <EmptyState message="No recent pricing calculations." />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
                color="error.main"
                sx={{ display: "flex", alignItems: "center" }}
              >
                <WarningAmberIcon sx={{ mr: 1 }} fontSize="small" />
                Low Stock Alerts
              </Typography>
              <EmptyState message="All stock levels are healthy." />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
