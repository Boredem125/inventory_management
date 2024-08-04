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
  const [showAll, setShowAll] = useState(true);

  const updateInventory = async () => {
    try {
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
      setFilteredInventory(inventoryList);
    } catch (error) {
      console.error("Error updating inventory: ", error);
    }
  };

  const addItem = async (item) => {
    if (!item) return;
    try {
      const docRef = doc(collection(firestore, "inventory"), item);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const { quantity } = docSnap.data();
        await setDoc(docRef, { quantity: quantity + 1 });
      } else {
        await setDoc(docRef, { quantity: 1 });
      }

      await updateInventory();
    } catch (error) {
      console.error("Error adding item: ", error);
    }
  };

  const removeItem = async (item) => {
    try {
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
    } catch (error) {
      console.error("Error removing item: ", error);
    }
  };

  useEffect(() => {
    updateInventory();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setItemName(""); // Clear item name when closing the modal
  };

  const handleSearch = () => {
    const results = inventory.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredInventory(results);
  };

  const handleShowAll = () => {
    setShowAll(true);
    setFilteredInventory(inventory);
  };

  const handleHideAll = () => {
    setShowAll(false);
    setFilteredInventory([]);
  };

  const handleAddNewItem = async () => {
    await addItem(itemName);
    handleClose(); // Close the modal after adding the item
  };

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
      justifyContent="space-between"
      alignItems="center"
      gap={2}
      bgcolor="#222"
      p={2}
    >
      {header}

      <Stack spacing={2} width="100%" mb={2} alignItems="center">
        <Stack direction="row" spacing={2} width="100%" maxWidth="600px" alignItems="center">
          <TextField
            variant="outlined"
            placeholder="Search items"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ backgroundColor: '#fff', color: '#000' }}
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
        flex="1"
        overflow="auto"
        bgcolor="#333"
        p={2}
        borderRadius={1}
      >
        <Stack
          width="100%"
          spacing={2}
        >
          <Box
            width="100%"
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            bgcolor="#555"
            color="#fff"
            p={1}
            borderRadius={1}
            mb={1}
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
          
          {filteredInventory.map((item, index) => (
            <Box
              key={item.name}
              width="100%"
              minHeight="40px"
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              bgcolor="#444"
              color="#fff"
              p={1}
              sx={{ boxSizing: 'border-box' }}
            >
              <Typography
                variant="body1"
                textAlign="center"
                flex="1"
              >
                {index + 1}
              </Typography>
              <Typography
                variant="body1"
                textAlign="left"
                flex="4"
                noWrap
              >
                {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
              </Typography>
              <Typography
                variant="body1"
                textAlign="center"
                flex="2"
              >
                {item.quantity}
              </Typography>
              <Stack direction="row" spacing={1} flex="3" justifyContent="center">
                <Button
                  variant="contained"
                  onClick={() => addItem(item.name)}
                  color="primary"
                  size="small"
                >
                  Add
                </Button>
                <Button
                  variant="contained"
                  onClick={() => removeItem(item.name)}
                  color="primary"
                  size="small"
                >
                  Remove
                </Button>
              </Stack>
            </Box>
          ))}
        </Stack>
      </Box>

      {/* Add New Item Modal */}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="add-new-item-modal"
        aria-describedby="add-new-item-description"
      >
        <Box
          bgcolor="#fff"
          p={4}
          borderRadius={2}
          boxShadow={3}
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          maxWidth="400px"
          width="100%"
        >
          <Typography variant="h6" mb={2}>
            Add New Item
          </Typography>
          <TextField
            variant="outlined"
            label="Item Name"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button variant="contained" onClick={handleAddNewItem} color="primary">
              Add
            </Button>
            <Button variant="outlined" onClick={handleClose}>
              Cancel
            </Button>
          </Stack>
        </Box>
      </Modal>
    </Box>
  );
}
