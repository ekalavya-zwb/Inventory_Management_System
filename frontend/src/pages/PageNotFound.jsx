import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Stack, Typography, Button } from "@mui/material";

const PageNotFound = () => {
  const navigate = useNavigate();

  return (
    <>
      <Box
        sx={{
          minHeight: "90vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <Stack spacing={0}>
          <Typography variant="h1" fontWeight={700}>
            404
          </Typography>

          <Typography variant="h5" color="text.secondary">
            Page Not Found
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
            The page you are looking for doesn’t exist or has been moved.
          </Typography>

          <Button
            variant="contained"
            size="large"
            sx={{ mt: 3 }}
            onClick={() => navigate("/")}
          >
            Go Back Home
          </Button>
        </Stack>
      </Box>
    </>
  );
};

export default PageNotFound;
