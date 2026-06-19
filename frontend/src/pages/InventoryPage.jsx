import React from "react";
import { Box, Tabs, Tab } from "@mui/material";
import PageHeader from "../components/common/PageHeader";
import EmptyState from "../components/common/EmptyState";

const InventoryPage = () => {
  const [tab, setTab] = React.useState(0);

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  return (
    <Box>
      <PageHeader
        title="Inventory Management"
        breadcrumbs={[{ label: "Inventory", path: "/inventory" }]}
      />

      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={tab}
          onChange={handleTabChange}
          aria-label="inventory tabs"
        >
          <Tab label="All Items (0)" />
          <Tab label="Low Stock (0)" sx={{ color: "error.main" }} />
          <Tab label="Medium Stock (0)" sx={{ color: "warning.main" }} />
          <Tab label="High Stock (0)" sx={{ color: "success.main" }} />
        </Tabs>
      </Box>

      <EmptyState message="No inventory data available." />
    </Box>
  );
};

export default InventoryPage;
