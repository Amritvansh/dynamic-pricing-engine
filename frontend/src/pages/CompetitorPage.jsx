import React from "react";
import { Box, Button, TextField, MenuItem } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import PageHeader from "../components/common/PageHeader";
import EmptyState from "../components/common/EmptyState";

const CompetitorPage = () => {
  return (
    <Box>
      <PageHeader
        title="Competitor Pricing"
        breadcrumbs={[{ label: "Competitors", path: "/competitors" }]}
        rightContent={
          <Button variant="contained" startIcon={<AddIcon />}>
            Add Competitor Price
          </Button>
        }
      />

      <Box sx={{ mb: 3, maxWidth: 300 }}>
        <TextField
          select
          fullWidth
          label="Filter by Product"
          defaultValue="all"
          size="small"
        >
          <MenuItem value="all">All Products</MenuItem>
        </TextField>
      </Box>

      <EmptyState message="No competitor prices recorded yet." />
    </Box>
  );
};

export default CompetitorPage;
