const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      enum: [
        "Agricultural product",
        "Agricultural tools",
        "buffalo",
        "cow",
        "hoers",
        "dog",
        "ox",
        "camel",
        "drip & shower",
        "tractor",
        "trolley",
        "sanedo",
        "four wheel",
        "two wheel",
        "got & sheep",
        "organic fertilizer",
        "nursery plants",
        "seeds & medicine",
      ],
    },
  },
  {
    timestamps: true,
  }
);

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
