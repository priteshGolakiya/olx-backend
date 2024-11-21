// controller/common/address/addressController.js

const Address = require("../../../models/addressModel");

// Get all addresses for the logged-in user
const getUserAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.userId });
    res.status(200).json(addresses);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// Get address by ID for the logged-in user
const getUserAddressById = async (req, res) => {
  const { addressId } = req.params;
  try {
    const address = await Address.findOne({
      _id: addressId,
      user: req.userId,
    });
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }
    res.status(200).json(address);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// Create a new address for the logged-in user
const createUserAddress = async (req, res) => {
  const { street, city, state, country, zipCode, longitude, latitude } =
    req.body;

  // console.log('req.body::: ', req.body);
  try {
    const newAddress = new Address({
      user: req.userId,
      street,
      city,
      state,
      country,
      zipCode,
      longitude,
      latitude,
    });
    await newAddress.save();
    res.status(201).json({ newAddress, success: true });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// Update address by ID for the logged-in user
const updateUserAddressById = async (req, res) => {
  const { addressId } = req.params;
  const { street, city, state, country, zipCode, longitude, latitude } =
    req.body;
  try {
    const address = await Address.findOneAndUpdate(
      { _id: addressId, user: req.userId },
      { street, city, state, country, zipCode, longitude, latitude },
      { new: true }
    );
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }
    res.status(200).json(address);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// Delete address by ID for the logged-in user
const deleteUserAddressById = async (req, res) => {
  const { addressId } = req.params;
  try {
    const address = await Address.findOneAndDelete({
      _id: addressId,
      user: req.userId,
    });
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }
    res.status(200).json({ message: "Address deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

module.exports = {
  getUserAddresses,
  getUserAddressById,
  createUserAddress,
  updateUserAddressById,
  deleteUserAddressById,
};
