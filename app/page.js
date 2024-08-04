'use client'
import { useState, useEffect } from "react";
import { firestore } from '@/firebase';
import { Box, Stack, TextField, Typography, Modal, Button } from "@mui/material";
import { collection, deleteDoc, query, setDoc, getDocs, doc, getDoc } from "firebase/firestore";

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [showAll, setShowAll] = useState(true); // New state to track "show all" state

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, "inventory"));
    const docs = await getDocs(snapshot);
    const inventoryList = [];
    docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      });
    });
    setInventory(inventoryList);
    setFilteredInventory(inventoryList); // Ensure filteredInventory is updated with full list initially
  };

  const addItem = async (item) => {
    if (!item) return; // Prevent adding empty items
    const docRef = doc(collection(firestore, "inventory"), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1 });
    } else {
      await setDoc(docRef, { quantity: 1 });
    }

    await updateInventory();
  };

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, "inventory"), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: quantity - 1 });
      }
    }

    await updateInventory();
  };

  useEffect(() => {
    updateInventory();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSearch = () => {
    const results = inventory.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredInventory(results);
  };

  const handleShowAll = () => {
    setShowAll(true);
    setFilteredInventory(inventory); // Show all items
  };

  const handleHideAll = () => {
    setShowAll(false);
    setFilteredInventory([]); // Hide all items
  };

  // New header position
  const header = (
    <Box
      height="100px"
      bgcolor="#222"
      display="flex"
      alignItems="center"
      justifyContent="center"
      color="#fff"
    >
      <Typography variant="h2">
        INVENTORY ITEMS
      </Typography>
    </Box>
  );

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="space-between" // Distribute space equally
      alignItems="center"
      gap={2}
      bgcolor="#222"
      p={2} // Add padding to container for spacing
    >
      {/* New header position */}
      {header}

      <Stack spacing={2} width="100%" mb={2} alignItems="center">
        <Stack direction="row" spacing={2} width="100%" maxWidth="600px" alignItems="center">
          <TextField
            variant="outlined"
            placeholder="Search items"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ backgroundColor: '#fff', color: '#000' }} // Set background and text color for search box
            fullWidth
          />
          <Button variant="contained" onClick={handleSearch} color="primary">
            Search
          </Button>
          <Button variant="contained" onClick={handleShowAll} color="primary">
            Show All
          </Button>
          <Button variant="contained" onClick={handleHideAll} color="primary">
            Hide All
          </Button>
        </Stack>
        <Button variant="contained" onClick={handleOpen} color="primary">
          Add New Item
        </Button>
      </Stack>

      <Box
        width="100%"
        flex="1" // Allow the inventory list to grow and take available space
        overflow="auto"
        bgcolor="#333"
        p={2}
        borderRadius={1}
      >
        <Stack
          width="100%"
          spacing={2} // Adjust the spacing between items
        >
          {/* Column Headers */}
          <Box
            width="100%"
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            bgcolor="#555"
            color="#fff"
            p={1}
            borderRadius={1}
            mb={1} // Margin bottom to separate header from items
          >
            <Typography variant="h6" flex="1" textAlign="center">
              S.No
            </Typography>
            <Typography variant="h6" flex="4" textAlign="left">
              Name
            </Typography>
            <Typography variant="h6" flex="2" textAlign="center">
              Quantity
            </Typography>
            <Typography variant="h6" flex="3" textAlign="center">
              Actions
            </Typography>
          </Box>
          
          {/* Inventory Items */}
          {filteredInventory.map((item, index) => (
            <Box
              key={item.name}
              width="100%"
              minHeight="40px" // Reduced minHeight for smaller item boxes
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              bgcolor="#444"
              color="#fff"
              p={1} // Added padding for better spacing
              sx={{ boxSizing: 'border-box' }} // Ensure padding is included in the width
            >
              <Typography
                variant="body1" // Reduced text size for serial number
                textAlign="center"
                flex="1" // Fixed width for serial number
              >
                {index + 1}
              </Typography>
              <Typography
                variant="body1" // Reduced text size for item name
                textAlign="left"
                flex="4" // Allocate space for item name
                noWrap // Prevent text wrapping
              >
                {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
              </Typography>
              <Typography
                variant="body1" // Reduced text size for quantity
                textAlign="center"
                flex="2" // Allocate space for quantity
              >
                {item.quantity}
              </Typography>
              <Stack direction="row" spacing={1} flex="3" justifyContent="center">
                <Button
                  variant="contained"
                  onClick={() => {
                    addItem(item.name);
                  }}
                  color="primary"
                  size="small" // Smaller button size
                >
                  Add
                </Button>
                <Button
                  variant="contained"
                  onClick={() => {
                    removeItem(item.name);
                  }}
                  color="primary"
                  size="small" // Smaller button size
                >
                  Remove
                </Button>
              </Stack>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
