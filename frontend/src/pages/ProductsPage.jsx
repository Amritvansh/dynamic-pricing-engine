import React from "react";
import { Box, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import PageHeader from "../components/common/PageHeader";
import EmptyState from "../components/common/EmptyState";

const ProductsPage = () => {
  return (
    <Box>
      <PageHeader
        title="Product Catalog"
        breadcrumbs={[{ label: "Products", path: "/products" }]}
        rightContent={
          <Button variant="contained" startIcon={<AddIcon />}>
            Add Product
          </Button>
        }
      />

      <EmptyState message="No products found. Click 'Add Product' to create one." />
    </Box>
  );
};

export default ProductsPage;
