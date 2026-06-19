import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";

const StatCard = ({ title, value, icon, color = "primary.main", trend }) => {
  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <Box>
            <Typography
              color="textSecondary"
              variant="subtitle2"
              gutterBottom
              sx={{ fontWeight: 500, textTransform: "uppercase" }}
            >
              {title}
            </Typography>
            <Typography
              variant="h4"
              component="div"
              sx={{ fontWeight: 700, color: "#111827" }}
            >
              {value}
            </Typography>
            {trend && (
              <Typography
                variant="body2"
                sx={{
                  mt: 1,
                  color: trend.isPositive
                    ? "success.main"
                    : trend.isNeutral
                      ? "text.secondary"
                      : "error.main",
                  display: "flex",
                  alignItems: "center",
                  fontWeight: 500,
                }}
              >
                {trend.value}
                <Typography
                  component="span"
                  variant="caption"
                  sx={{ ml: 0.5, color: "text.secondary" }}
                >
                  {trend.label}
                </Typography>
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              backgroundColor: `${color}15`,
              p: 1.5,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {React.cloneElement(icon, { sx: { color: color, fontSize: 28 } })}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatCard;
