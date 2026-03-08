import { useState, useEffect } from "react";
import { theme, storeColors } from "../theme";
import BottomNav from "../components/BottomNav";

// ---------- Brand tiers ----------
const BRAND_TIER = { generic: 0, mid: 1, brand: 2 };

// ---------- Full variant price data ----------
const ITEM_VARIANTS = {
  "2% Milk (4L)": [
    { variantName: "Lactantia 2% Milk (4L)", tier: BRAND_TIER.brand,   prices: { "No Frills": 5.49, "Walmart": 5.47, "Loblaws": 5.99, "Metro": 5.79, "Food Basics": 5.19, "Farah Foods": 5.39 } },
    { variantName: "Neilson 2% Milk (4L)",   tier: BRAND_TIER.brand,   prices: { "No Frills": 5.29, "Walmart": 5.17, "Loblaws": 5.79, "Metro": 5.59, "Food Basics": 4.99, "Farah Foods": 5.19 } },
    { variantName: "No Name 2% Milk (4L)",   tier: BRAND_TIER.generic, prices: { "No Frills": 4.27 } },
    { variantName: "Great Value 2% Milk",    tier: BRAND_TIER.generic, prices: { "Walmart": 4.49 } },
    { variantName: "PC 2% Milk (4L)",        tier: BRAND_TIER.generic, prices: { "Loblaws": 4.79 } },
    { variantName: "Irresistibles 2% Milk",  tier: BRAND_TIER.generic, prices: { "Metro": 4.69 } },
  ],
  "Whole Milk (4L)": [
    { variantName: "Lactantia Whole Milk (4L)", tier: BRAND_TIER.brand,   prices: { "No Frills": 5.79, "Walmart": 5.67, "Loblaws": 6.29, "Metro": 5.99, "Food Basics": 5.49, "Farah Foods": 5.69 } },
    { variantName: "No Name Whole Milk (4L)",   tier: BRAND_TIER.generic, prices: { "No Frills": 4.79 } },
    { variantName: "Great Value Whole Milk",    tier: BRAND_TIER.generic, prices: { "Walmart": 4.57 } },
    { variantName: "PC Whole Milk (4L)",        tier: BRAND_TIER.generic, prices: { "Loblaws": 4.99 } },
    { variantName: "Irresistibles Whole Milk",  tier: BRAND_TIER.generic, prices: { "Metro": 4.89 } },
  ],
  "Oat Milk": [
    { variantName: "Oatly Oat Milk",         tier: BRAND_TIER.brand,   prices: { "No Frills": 5.49, "Walmart": 5.27, "Loblaws": 5.99, "Metro": 5.79, "Food Basics": 5.19, "Farah Foods": 6.49 } },
    { variantName: "Earth's Own Oat Milk",   tier: BRAND_TIER.mid,     prices: { "No Frills": 4.49, "Walmart": 4.27, "Loblaws": 4.99, "Metro": 4.79, "Food Basics": 4.19, "Farah Foods": 5.29 } },
    { variantName: "No Name Oat Milk",       tier: BRAND_TIER.generic, prices: { "No Frills": 3.49 } },
    { variantName: "Great Value Oat Milk",   tier: BRAND_TIER.generic, prices: { "Walmart": 3.27 } },
    { variantName: "PC Oat Milk",            tier: BRAND_TIER.generic, prices: { "Loblaws": 3.79 } },
    { variantName: "Irresistibles Oat Milk", tier: BRAND_TIER.generic, prices: { "Metro": 3.69 } },
  ],
  "Almond Milk": [
    { variantName: "Silk Almond Milk",           tier: BRAND_TIER.brand,   prices: { "No Frills": 4.49, "Walmart": 4.27, "Loblaws": 4.99, "Metro": 4.79, "Food Basics": 4.19, "Farah Foods": 5.29 } },
    { variantName: "No Name Almond Milk",        tier: BRAND_TIER.generic, prices: { "No Frills": 3.17 } },
    { variantName: "Great Value Almond Milk",    tier: BRAND_TIER.generic, prices: { "Walmart": 3.49 } },
    { variantName: "PC Almond Milk",             tier: BRAND_TIER.generic, prices: { "Loblaws": 3.79 } },
    { variantName: "Irresistibles Almond Milk",  tier: BRAND_TIER.generic, prices: { "Metro": 3.69 } },
  ],
  "Large Eggs (12pk)": [
    { variantName: "Burnbrae Farms Eggs (12pk)", tier: BRAND_TIER.brand,   prices: { "No Frills": 4.49, "Walmart": 4.27, "Loblaws": 4.99, "Metro": 4.79, "Food Basics": 3.99, "Farah Foods": 3.79 } },
    { variantName: "No Name Eggs (12pk)",        tier: BRAND_TIER.generic, prices: { "No Frills": 3.49 } },
    { variantName: "Great Value Eggs (12pk)",    tier: BRAND_TIER.generic, prices: { "Walmart": 3.27 } },
    { variantName: "PC Eggs (12pk)",             tier: BRAND_TIER.generic, prices: { "Loblaws": 3.79 } },
    { variantName: "Irresistibles Eggs (12pk)",  tier: BRAND_TIER.generic, prices: { "Metro": 3.69 } },
  ],
  "Free-Run Eggs (12pk)": [
    { variantName: "Burnbrae Nestlaid (12pk)",    tier: BRAND_TIER.brand,   prices: { "No Frills": 6.49, "Walmart": 6.27, "Loblaws": 6.99, "Metro": 6.79, "Food Basics": 6.19, "Farah Foods": 7.29 } },
    { variantName: "No Name Free-Run (12pk)",     tier: BRAND_TIER.generic, prices: { "No Frills": 5.49 } },
    { variantName: "Great Value Free-Run (12pk)", tier: BRAND_TIER.generic, prices: { "Walmart": 5.27 } },
    { variantName: "PC Free-Run Eggs (12pk)",     tier: BRAND_TIER.generic, prices: { "Loblaws": 5.79 } },
    { variantName: "Irresistibles Free-Run",      tier: BRAND_TIER.generic, prices: { "Metro": 5.69 } },
  ],
  "Chicken Breasts": [
    { variantName: "Maple Leaf Chicken Breasts",  tier: BRAND_TIER.brand,   prices: { "No Frills": 9.49, "Walmart": 10.27, "Loblaws": 11.99, "Metro": 10.99, "Food Basics": 9.55, "Farah Foods": 8.99 } },
    { variantName: "No Name Chicken Breasts",     tier: BRAND_TIER.generic, prices: { "No Frills": 8.20 } },
    { variantName: "Great Value Chicken Breasts", tier: BRAND_TIER.generic, prices: { "Walmart": 8.27 } },
    { variantName: "PC Chicken Breasts",          tier: BRAND_TIER.generic, prices: { "Loblaws": 8.99 } },
    { variantName: "Irresistibles Chicken",       tier: BRAND_TIER.generic, prices: { "Metro": 8.79 } },
  ],
  "Ground Beef (lean)": [
    { variantName: "Maple Leaf Ground Beef",    tier: BRAND_TIER.brand,   prices: { "No Frills": 9.49, "Walmart": 9.27, "Loblaws": 10.99, "Metro": 9.99, "Food Basics": 8.99, "Farah Foods": 11.49 } },
    { variantName: "No Name Ground Beef",       tier: BRAND_TIER.generic, prices: { "No Frills": 7.49 } },
    { variantName: "Great Value Ground Beef",   tier: BRAND_TIER.generic, prices: { "Walmart": 7.27 } },
    { variantName: "PC Ground Beef (lean)",     tier: BRAND_TIER.generic, prices: { "Loblaws": 7.99 } },
    { variantName: "Irresistibles Ground Beef", tier: BRAND_TIER.generic, prices: { "Metro": 7.79 } },
  ],
  "Bacon (375g)": [
    { variantName: "Maple Leaf Bacon (375g)",  tier: BRAND_TIER.brand,   prices: { "No Frills": 7.49, "Walmart": 6.99, "Loblaws": 8.49, "Metro": 7.99, "Food Basics": 6.99, "Farah Foods": 9.49 } },
    { variantName: "Schneiders Bacon (375g)",  tier: BRAND_TIER.brand,   prices: { "No Frills": 6.99, "Walmart": 6.77, "Loblaws": 7.99, "Metro": 7.49, "Food Basics": 6.49, "Farah Foods": 8.99 } },
    { variantName: "No Name Bacon (375g)",     tier: BRAND_TIER.generic, prices: { "No Frills": 5.20 } },
    { variantName: "Great Value Bacon (375g)", tier: BRAND_TIER.generic, prices: { "Walmart": 5.27 } },
    { variantName: "PC Bacon (375g)",          tier: BRAND_TIER.generic, prices: { "Loblaws": 4.00 } },
    { variantName: "Irresistibles Bacon",      tier: BRAND_TIER.generic, prices: { "Metro": 5.69 } },
  ],
  "Salmon Fillet": [
    { variantName: "Ocean's Salmon Fillet",     tier: BRAND_TIER.brand,   prices: { "No Frills": 10.99, "Walmart": 10.47, "Loblaws": 12.99, "Metro": 11.99, "Food Basics": 9.99, "Farah Foods": 8.49 } },
    { variantName: "No Name Salmon Fillet",     tier: BRAND_TIER.generic, prices: { "No Frills": 8.99 } },
    { variantName: "Great Value Salmon Fillet", tier: BRAND_TIER.generic, prices: { "Walmart": 8.47 } },
    { variantName: "PC Salmon Fillet",          tier: BRAND_TIER.generic, prices: { "Loblaws": 9.49 } },
    { variantName: "Irresistibles Salmon",      tier: BRAND_TIER.generic, prices: { "Metro": 9.29 } },
  ],
  "Bananas (bunch)": [
    { variantName: "Dole Bananas (bunch)", tier: BRAND_TIER.brand,   prices: { "No Frills": 1.97, "Walmart": 1.87, "Loblaws": 2.29, "Metro": 2.09, "Food Basics": 1.77, "Farah Foods": 1.60 } },
    { variantName: "Bananas (bunch)",      tier: BRAND_TIER.generic, prices: { "No Frills": 1.47, "Walmart": 1.37, "Loblaws": 1.96, "Metro": 1.79, "Food Basics": 1.27, "Farah Foods": 0.99 } },
  ],
  "Strawberries (1lb)": [
    { variantName: "Driscoll's Strawberries", tier: BRAND_TIER.brand,   prices: { "No Frills": 4.99, "Walmart": 4.77, "Loblaws": 5.99, "Metro": 5.49, "Food Basics": 4.49, "Farah Foods": 5.99 } },
    { variantName: "Strawberries (1lb)",      tier: BRAND_TIER.generic, prices: { "No Frills": 3.49, "Walmart": 3.27, "Loblaws": 4.49, "Metro": 3.99, "Food Basics": 2.99, "Farah Foods": 2.49 } },
  ],
  "Blueberries (pint)": [
    { variantName: "Driscoll's Blueberries", tier: BRAND_TIER.brand,   prices: { "No Frills": 3.99, "Walmart": 3.77, "Loblaws": 4.49, "Metro": 4.29, "Food Basics": 3.49, "Farah Foods": 4.79 } },
    { variantName: "Blueberries (pint)",     tier: BRAND_TIER.generic, prices: { "No Frills": 2.49, "Walmart": 2.27, "Loblaws": 2.99, "Metro": 2.79, "Food Basics": 1.99, "Farah Foods": 2.99 } },
  ],
  "Broccoli (head)": [
    { variantName: "Broccoli (head)", tier: BRAND_TIER.generic, prices: { "No Frills": 1.49, "Walmart": 1.37, "Loblaws": 2.49, "Metro": 1.99, "Food Basics": 1.27, "Farah Foods": 0.89 } },
  ],
  "Spinach (bag)": [
    { variantName: "Earthbound Organic Spinach", tier: BRAND_TIER.brand,   prices: { "No Frills": 4.49, "Walmart": 4.27, "Loblaws": 2.50, "Metro": 4.79, "Food Basics": 3.99, "Farah Foods": 5.49 } },
    { variantName: "No Name Spinach (bag)",      tier: BRAND_TIER.generic, prices: { "No Frills": 2.49 } },
    { variantName: "Great Value Spinach",        tier: BRAND_TIER.generic, prices: { "Walmart": 2.27 } },
    { variantName: "PC Spinach (bag)",           tier: BRAND_TIER.generic, prices: { "Loblaws": 2.00 } },
    { variantName: "Irresistibles Spinach",      tier: BRAND_TIER.generic, prices: { "Metro": 2.69 } },
  ],
  "White Sandwich Bread": [
    { variantName: "Wonder White Bread",        tier: BRAND_TIER.brand,   prices: { "No Frills": 3.99, "Walmart": 3.49, "Loblaws": 4.49, "Metro": 4.29, "Food Basics": 3.49, "Farah Foods": 4.99 } },
    { variantName: "Dempster's White Bread",    tier: BRAND_TIER.brand,   prices: { "No Frills": 3.79, "Walmart": 3.57, "Loblaws": 4.29, "Metro": 4.09, "Food Basics": 3.29, "Farah Foods": 4.79 } },
    { variantName: "No Name White Bread",       tier: BRAND_TIER.generic, prices: { "No Frills": 2.49 } },
    { variantName: "Great Value White Bread",   tier: BRAND_TIER.generic, prices: { "Walmart": 2.27 } },
    { variantName: "PC White Bread",            tier: BRAND_TIER.generic, prices: { "Loblaws": 2.79 } },
    { variantName: "Irresistibles White Bread", tier: BRAND_TIER.generic, prices: { "Metro": 2.69 } },
  ],
  "Whole Wheat Bread": [
    { variantName: "Wonder Whole Wheat Bread",     tier: BRAND_TIER.brand,   prices: { "No Frills": 4.29, "Walmart": 4.07, "Loblaws": 4.79, "Metro": 4.59, "Food Basics": 3.79, "Farah Foods": 5.19 } },
    { variantName: "Dempster's Whole Wheat Bread", tier: BRAND_TIER.brand,   prices: { "No Frills": 4.09, "Walmart": 3.87, "Loblaws": 4.59, "Metro": 4.39, "Food Basics": 3.59, "Farah Foods": 4.99 } },
    { variantName: "No Name Whole Wheat Bread",    tier: BRAND_TIER.generic, prices: { "No Frills": 2.99 } },
    { variantName: "Great Value Whole Wheat",      tier: BRAND_TIER.generic, prices: { "Walmart": 2.77 } },
    { variantName: "PC Whole Wheat Bread",         tier: BRAND_TIER.generic, prices: { "Loblaws": 3.29 } },
    { variantName: "Irresistibles Whole Wheat",    tier: BRAND_TIER.generic, prices: { "Metro": 3.19 } },
  ],
  "Cheddar – Mild": [
    { variantName: "Cracker Barrel Cheddar", tier: BRAND_TIER.brand,   prices: { "No Frills": 7.99, "Walmart": 7.77, "Loblaws": 8.99, "Metro": 8.49, "Food Basics": 7.49, "Farah Foods": 9.49 } },
    { variantName: "Black Diamond Cheddar",  tier: BRAND_TIER.brand,   prices: { "No Frills": 7.49, "Walmart": 7.27, "Loblaws": 8.49, "Metro": 7.99, "Food Basics": 6.99, "Farah Foods": 8.99 } },
    { variantName: "No Name Cheddar",        tier: BRAND_TIER.generic, prices: { "No Frills": 5.49 } },
    { variantName: "Great Value Cheddar",    tier: BRAND_TIER.generic, prices: { "Walmart": 5.27 } },
    { variantName: "PC Cheddar – Mild",      tier: BRAND_TIER.generic, prices: { "Loblaws": 5.79 } },
    { variantName: "Irresistibles Cheddar",  tier: BRAND_TIER.generic, prices: { "Metro": 5.69 } },
  ],
  "Greek Yogurt (Plain)": [
    { variantName: "Chobani Greek Yogurt",       tier: BRAND_TIER.brand,   prices: { "No Frills": 4.99, "Walmart": 4.77, "Loblaws": 5.49, "Metro": 5.29, "Food Basics": 4.49, "Farah Foods": 5.99 } },
    { variantName: "Oikos Greek Yogurt",         tier: BRAND_TIER.brand,   prices: { "No Frills": 4.49, "Walmart": 4.27, "Loblaws": 4.99, "Metro": 4.79, "Food Basics": 3.99, "Farah Foods": 5.49 } },
    { variantName: "No Name Greek Yogurt",       tier: BRAND_TIER.generic, prices: { "No Frills": 2.79 } },
    { variantName: "Great Value Greek Yogurt",   tier: BRAND_TIER.generic, prices: { "Walmart": 2.57 } },
    { variantName: "PC Greek Yogurt",            tier: BRAND_TIER.generic, prices: { "Loblaws": 2.99 } },
    { variantName: "Irresistibles Greek Yogurt", tier: BRAND_TIER.generic, prices: { "Metro": 2.89 } },
  ],
  "Butter (454g)": [
    { variantName: "Lactantia Butter (454g)", tier: BRAND_TIER.brand,   prices: { "No Frills": 6.99, "Walmart": 6.77, "Loblaws": 7.99, "Metro": 7.49, "Food Basics": 6.49, "Farah Foods": 8.49 } },
    { variantName: "Gay Lea Butter (454g)",   tier: BRAND_TIER.brand,   prices: { "No Frills": 6.49, "Walmart": 6.27, "Loblaws": 7.49, "Metro": 6.99, "Food Basics": 5.99, "Farah Foods": 7.99 } },
    { variantName: "No Name Butter (454g)",   tier: BRAND_TIER.generic, prices: { "No Frills": 5.49 } },
    { variantName: "Great Value Butter",      tier: BRAND_TIER.generic, prices: { "Walmart": 5.27 } },
    { variantName: "PC Butter (454g)",        tier: BRAND_TIER.generic, prices: { "Loblaws": 5.79 } },
    { variantName: "Irresistibles Butter",    tier: BRAND_TIER.generic, prices: { "Metro": 5.69 } },
  ],
  "Spaghetti": [
    { variantName: "Barilla Spaghetti",       tier: BRAND_TIER.brand,   prices: { "No Frills": 2.49, "Walmart": 2.27, "Loblaws": 2.99, "Metro": 2.79, "Food Basics": 2.19, "Farah Foods": 3.49 } },
    { variantName: "No Name Spaghetti",       tier: BRAND_TIER.generic, prices: { "No Frills": 1.49 } },
    { variantName: "Great Value Spaghetti",   tier: BRAND_TIER.generic, prices: { "Walmart": 1.27 } },
    { variantName: "PC Spaghetti",            tier: BRAND_TIER.generic, prices: { "Loblaws": 1.79 } },
    { variantName: "Irresistibles Spaghetti", tier: BRAND_TIER.generic, prices: { "Metro": 1.69 } },
  ],
  "Penne": [
    { variantName: "Barilla Penne",       tier: BRAND_TIER.brand,   prices: { "No Frills": 2.49, "Walmart": 2.27, "Loblaws": 2.99, "Metro": 2.79, "Food Basics": 2.19, "Farah Foods": 3.29 } },
    { variantName: "No Name Penne",       tier: BRAND_TIER.generic, prices: { "No Frills": 1.00 } },
    { variantName: "Great Value Penne",   tier: BRAND_TIER.generic, prices: { "Walmart": 1.27 } },
    { variantName: "PC Penne",            tier: BRAND_TIER.generic, prices: { "Loblaws": 1.79 } },
    { variantName: "Irresistibles Penne", tier: BRAND_TIER.generic, prices: { "Metro": 1.69 } },
  ],
  "White Rice (2kg)": [
    { variantName: "Uncle Ben's Rice (2kg)",   tier: BRAND_TIER.brand,   prices: { "No Frills": 5.49, "Walmart": 5.27, "Loblaws": 5.99, "Metro": 5.79, "Food Basics": 4.99, "Farah Foods": 4.29 } },
    { variantName: "No Name White Rice (2kg)", tier: BRAND_TIER.generic, prices: { "No Frills": 3.99 } },
    { variantName: "Great Value White Rice",   tier: BRAND_TIER.generic, prices: { "Walmart": 3.47 } },
    { variantName: "PC White Rice (2kg)",      tier: BRAND_TIER.generic, prices: { "Loblaws": 4.29 } },
    { variantName: "Irresistibles White Rice", tier: BRAND_TIER.generic, prices: { "Metro": 4.19 } },
  ],
  "Olive Oil (500ml)": [
    { variantName: "Bertolli Olive Oil (500ml)", tier: BRAND_TIER.brand,   prices: { "No Frills": 8.99, "Walmart": 8.47, "Loblaws": 9.99, "Metro": 9.49, "Food Basics": 7.99, "Farah Foods": 6.99 } },
    { variantName: "No Name Olive Oil (500ml)",  tier: BRAND_TIER.generic, prices: { "No Frills": 6.49 } },
    { variantName: "Great Value Olive Oil",      tier: BRAND_TIER.generic, prices: { "Walmart": 6.27 } },
    { variantName: "PC Olive Oil (500ml)",       tier: BRAND_TIER.generic, prices: { "Loblaws": 6.10 } },
    { variantName: "Irresistibles Olive Oil",    tier: BRAND_TIER.generic, prices: { "Metro": 6.79 } },
  ],
  "Pasta Sauce – Marinara": [
    { variantName: "Rao's Marinara Sauce",      tier: BRAND_TIER.brand,   prices: { "No Frills": 8.99, "Walmart": 8.47, "Loblaws": 9.99, "Metro": 9.49, "Food Basics": 7.99, "Farah Foods": 10.99 } },
    { variantName: "Classico Marinara",         tier: BRAND_TIER.mid,     prices: { "No Frills": 3.99, "Walmart": 3.77, "Loblaws": 4.49, "Metro": 4.29, "Food Basics": 3.49, "Farah Foods": 4.99 } },
    { variantName: "No Name Pasta Sauce",       tier: BRAND_TIER.generic, prices: { "No Frills": 2.20 } },
    { variantName: "Great Value Pasta Sauce",   tier: BRAND_TIER.generic, prices: { "Walmart": 2.27 } },
    { variantName: "PC Pasta Sauce",            tier: BRAND_TIER.generic, prices: { "Loblaws": 2.79 } },
    { variantName: "Irresistibles Pasta Sauce", tier: BRAND_TIER.generic, prices: { "Metro": 2.69 } },
  ],
  "Avocados":             [{ variantName: "Avocados",             tier: BRAND_TIER.generic, prices: { "No Frills": 1.49, "Walmart": 1.27, "Loblaws": 1.99, "Metro": 1.79, "Food Basics": 1.19, "Farah Foods": 0.79 } }],
  "Cherry Tomatoes":      [{ variantName: "Cherry Tomatoes",      tier: BRAND_TIER.generic, prices: { "No Frills": 2.99, "Walmart": 2.77, "Loblaws": 3.99, "Metro": 3.49, "Food Basics": 2.49, "Farah Foods": 1.99 } }],
  "Russet Potatoes (bag)":[{ variantName: "Russet Potatoes (bag)",tier: BRAND_TIER.generic, prices: { "No Frills": 3.49, "Walmart": 3.27, "Loblaws": 4.49, "Metro": 3.99, "Food Basics": 2.99, "Farah Foods": 2.49 } }],
  "Romaine Lettuce":      [{ variantName: "Romaine Lettuce",      tier: BRAND_TIER.generic, prices: { "No Frills": 2.49, "Walmart": 2.27, "Loblaws": 3.49, "Metro": 2.99, "Food Basics": 1.99, "Farah Foods": 1.49 } }],
  "Watermelon (cut)":     [{ variantName: "Watermelon (cut)",     tier: BRAND_TIER.generic, prices: { "No Frills": 4.49, "Walmart": 4.27, "Loblaws": 5.49, "Metro": 4.99, "Food Basics": 3.99, "Farah Foods": 3.49 } }],
  "Orange Juice (2L)": [
    { variantName: "Tropicana OJ (2L)",     tier: BRAND_TIER.brand,   prices: { "No Frills": 5.49, "Walmart": 5.27, "Loblaws": 5.99, "Metro": 5.79, "Food Basics": 4.99, "Farah Foods": 6.99 } },
    { variantName: "Minute Maid OJ (2L)",   tier: BRAND_TIER.brand,   prices: { "No Frills": 4.99, "Walmart": 4.77, "Loblaws": 5.49, "Metro": 5.29, "Food Basics": 4.49, "Farah Foods": 6.49 } },
    { variantName: "No Name OJ (2L)",       tier: BRAND_TIER.generic, prices: { "No Frills": 3.49 } },
    { variantName: "Great Value OJ (2L)",   tier: BRAND_TIER.generic, prices: { "Walmart": 3.27 } },
    { variantName: "PC OJ (2L)",            tier: BRAND_TIER.generic, prices: { "Loblaws": 3.79 } },
    { variantName: "Irresistibles OJ (2L)", tier: BRAND_TIER.generic, prices: { "Metro": 3.69 } },
  ],
  "Canned Tuna": [
    { variantName: "Clover Leaf Tuna",          tier: BRAND_TIER.brand,   prices: { "No Frills": 2.49, "Walmart": 2.27, "Loblaws": 2.99, "Metro": 2.79, "Food Basics": 2.19, "Farah Foods": 3.29 } },
    { variantName: "No Name Canned Tuna",       tier: BRAND_TIER.generic, prices: { "No Frills": 1.49 } },
    { variantName: "Great Value Canned Tuna",   tier: BRAND_TIER.generic, prices: { "Walmart": 1.27 } },
    { variantName: "PC Canned Tuna",            tier: BRAND_TIER.generic, prices: { "Loblaws": 1.79 } },
    { variantName: "Irresistibles Canned Tuna", tier: BRAND_TIER.generic, prices: { "Metro": 1.69 } },
  ],
};

// ---------- Store config ----------
const STORES = ["No Frills", "Walmart", "Loblaws", "Metro", "Food Basics", "Farah Foods"];
// Only these carry their own store-brand generics (No Name, Great Value, PC, Irresistibles)
const GENERIC_STORE_POOL = ["No Frills", "Walmart", "Loblaws", "Metro"];

const STORE_MULTIPLIERS = {
  "No Frills": 0.88, "Walmart": 0.90, "Loblaws": 1.12,
  "Metro": 1.06, "Food Basics": 0.86, "Farah Foods": 0.92,
};

function getFallbackPrice(itemName, store) {
  const hash = itemName.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const base = 2.49 + (hash % 8);
  return parseFloat((base * (STORE_MULTIPLIERS[store] || 0.95)).toFixed(2));
}

// ---------- Brand mode config ----------
// generic → store-brand variants only, from GENERIC_STORE_POOL only
// mid     → mid-tier variants, all stores
// brand   → name-brand variants, all stores (Food Basics & Farah Foods compete)
const MODE_CFG = {
  generic: { tier: BRAND_TIER.generic, storePool: GENERIC_STORE_POOL },
  mid:     { tier: BRAND_TIER.mid,     storePool: STORES },
  brand:   { tier: BRAND_TIER.brand,   storePool: STORES },
};

// Best variant available at a specific store for a target tier.
// Falls back to any tier if exact match unavailable at that store.
function getBestVariantForStore(itemName, store, targetTier) {
  const variants = ITEM_VARIANTS[itemName];
  if (!variants) {
    return { price: getFallbackPrice(itemName, store), variantName: itemName, tier: targetTier };
  }
  const sv = variants
    .filter(v => v.prices[store] !== undefined)
    .map(v => ({ ...v, price: v.prices[store] }));
  if (sv.length === 0) {
    return { price: getFallbackPrice(itemName, store), variantName: itemName, tier: targetTier };
  }
  const exact = sv.filter(v => v.tier === targetTier);
  const pool = exact.length > 0 ? exact : sv;
  return pool.sort((a, b) => a.price - b.price)[0];
}

// Multi-store: each item independently goes to whichever store+variant is globally cheapest for the tier.
// This will naturally split items across stores when different stores win on different items.
function buildOptimizedCart(cartItems, brandMode, allowedStores) {
  const { tier: targetTier, storePool: rawPool } = MODE_CFG[brandMode];
  const storePool = allowedStores?.length
    ? rawPool.filter(s => allowedStores.some(a => a.toLowerCase().includes(s.toLowerCase())))
    : rawPool;
  const storeMap = {};

  cartItems.forEach(item => {
    let bestPrice = Infinity;
    let bestStore = null;
    let bestVariant = null;

    storePool.forEach(store => {
      const v = getBestVariantForStore(item.name, store, targetTier);
      if (v.price < bestPrice) {
        bestPrice = v.price;
        bestStore = store;
        bestVariant = v;
      }
    });

    if (!storeMap[bestStore]) storeMap[bestStore] = [];
    storeMap[bestStore].push({
      ...item,
      price: bestVariant.price,
      store: bestStore,
      variantName: bestVariant.variantName,
      tier: bestVariant.tier,
    });
  });

  return Object.entries(storeMap)
    .map(([store, items]) => ({
      name: store,
      items,
      subtotal: parseFloat(items.reduce((s, i) => s + i.price * i.qty, 0).toFixed(2)),
    }))
    .sort((a, b) => b.subtotal - a.subtotal); // largest spend first
}

// Single-store: find the ONE store with cheapest total for whole cart.
function buildSingleStoreCart(cartItems, brandMode, allowedStores) {
  const { tier: targetTier, storePool: rawPool } = MODE_CFG[brandMode];
  const storePool = allowedStores?.length
    ? rawPool.filter(s => allowedStores.some(a => a.toLowerCase().includes(s.toLowerCase())))
    : rawPool;

  const results = storePool.map(store => {
    const items = cartItems.map(item => {
      const v = getBestVariantForStore(item.name, store, targetTier);
      return { ...item, price: v.price, store, variantName: v.variantName, tier: v.tier };
    });
    const total = parseFloat(items.reduce((s, i) => s + i.price * i.qty, 0).toFixed(2));
    return { store, items, total };
  });

  return results.sort((a, b) => a.total - b.total)[0];
}

// ---------- Smart substitutions ----------
const SUB_RULES = [
  { match: "Strawberries (1lb)",   toName: "Frozen Strawberries (1lb)", toEmoji: "🍓", saveAmount: 2.50, reason: "Same nutrition, lasts longer" },
  { match: "Blueberries (pint)",   toName: "Frozen Blueberries",        toEmoji: "🫐", saveAmount: 1.50, reason: "Frozen is 40% cheaper" },
  { match: "Greek Yogurt (Plain)", toName: "No Name Greek Yogurt",      toEmoji: "🫙", saveAmount: 1.20, reason: "Same macros, store brand" },
  { match: "Butter (454g)",        toName: "No Frills Butter (454g)",   toEmoji: "🧈", saveAmount: 2.10, reason: "Store brand, same quality" },
  { match: "Chicken Breasts",      toName: "Chicken Thighs",            toEmoji: "🍗", saveAmount: 2.00, reason: "More flavour, lower cost" },
  { match: "Cheddar – Mild",       toName: "No Name Cheddar",           toEmoji: "🧀", saveAmount: 1.50, reason: "Store brand saves money" },
  { match: "Whole Wheat Bread",    toName: "No Frills Whole Wheat",     toEmoji: "🍞", saveAmount: 1.00, reason: "Same ingredients, cheaper" },
  { match: "White Sandwich Bread", toName: "No Frills White Bread",     toEmoji: "🍞", saveAmount: 0.80, reason: "Store brand option" },
  { match: "Salmon Fillet",        toName: "Canned Salmon",             toEmoji: "🐟", saveAmount: 3.00, reason: "Great for most recipes" },
  { match: "Olive Oil (500ml)",    toName: "Canola Oil (1L)",           toEmoji: "🫙", saveAmount: 2.50, reason: "Neutral taste, much cheaper" },
  { match: "Orange Juice (2L)",    toName: "Frozen OJ Concentrate",     toEmoji: "🧃", saveAmount: 1.50, reason: "Same taste when mixed" },
];

async function fetchGeminiSubstitutions(cartItems) {
  const subs = [];
  cartItems.forEach(item => {
    // Only match on the original item name — if it's already been subbed the name won't match
    const rule = SUB_RULES.find(r => r.match === item.name);
    if (rule) {
      subs.push({
        id: item.id,
        fromName: rule.match,
        fromEmoji: item.emoji,
        toName: rule.toName,
        toEmoji: rule.toEmoji,
        saveAmount: rule.saveAmount,
        reason: rule.reason,
      });
    }
  });
  return subs;
}

// Derive brand mode label info from brandSlider value (0=generic, 50=mid, 100=brand)
const MODE_META = {
  generic: { emoji: "🟢", label: "No Name",  bg: "#e8f5e9", border: "#4caf50", text: "#2e7d32" },
  mid:     { emoji: "🟡", label: "Mixed",     bg: "#fffde7", border: "#f9a825", text: "#e65100" },
  brand:   { emoji: "🔵", label: "Brand",     bg: "#e3f2fd", border: "#1976d2", text: "#0d47a1" },
};

export default function OptimizePage({ setPage, cartItems = [], setCartItems, budget, brandSlider = 50 }) {
  // brandMode is purely derived from the CartPage slider — no local state needed
  const brandMode = brandSlider <= 16 ? "generic" : brandSlider <= 66 ? "mid" : "brand";
  const [strategy, setStrategy] = useState("multi");
  const [substitutions, setSubstitutions] = useState([]);
  const [loadingSubs, setLoadingSubs] = useState(true);
  const [appliedSubs, setAppliedSubs] = useState([]);

  const selectedStoreNames = (() => {
    try {
      const raw = localStorage.getItem("cartly_preferences");
      if (raw) {
        const prefs = JSON.parse(raw);
        if (prefs.selected_stores?.length) return prefs.selected_stores.map(s => s.name);
      }
    } catch {}
    return [];
  })();

  const multiStores  = buildOptimizedCart(cartItems, brandMode, selectedStoreNames);
  const singleResult = buildSingleStoreCart(cartItems, brandMode, selectedStoreNames);

  const multiTotal  = parseFloat(multiStores.reduce((s, st) => s + st.subtotal, 0).toFixed(2));
  const singleTotal = singleResult?.total || 0;
  const activeTotal = strategy === "single" ? singleTotal : multiTotal;
  const budgetNum   = parseFloat(budget) || 0;

  const totalSaved = appliedSubs.reduce((sum, id) => {
    const sub = substitutions.find(s => s.id === id);
    return sum + (sub ? sub.saveAmount : 0);
  }, 0);

  const finalTotal       = parseFloat((activeTotal - totalSaved).toFixed(2));
  const budgetDiff       = budgetNum > 0 ? (budgetNum - finalTotal).toFixed(2) : null;
  const underBudget      = budgetDiff !== null && parseFloat(budgetDiff) >= 0;
  const multiIsMultiple  = multiStores.length > 1;
  const multiSaving      = Math.max(0, singleTotal - multiTotal);

  const activeItems = strategy === "single"
    ? (singleResult?.items || [])
    : multiStores.flatMap(s => s.items);

  const currentMode = MODE_META[brandMode];

  // Load substitution suggestions whenever cart changes
  useEffect(() => {
    if (cartItems.length === 0) { setLoadingSubs(false); return; }
    setLoadingSubs(true);
    fetchGeminiSubstitutions(cartItems)
      .then(subs => setSubstitutions(subs))
      .finally(() => setLoadingSubs(false));
  }, [cartItems]);

  // Clear applied subs when brand preference changes
  useEffect(() => { setAppliedSubs([]); }, [brandMode]);

  const applySubstitution = (sub) => {
    if (appliedSubs.includes(sub.id)) {
      setCartItems(prev => prev.map(i => i.id === sub.id ? { ...i, name: sub.fromName, emoji: sub.fromEmoji } : i));
      setAppliedSubs(prev => prev.filter(id => id !== sub.id));
    } else {
      setCartItems(prev => prev.map(i => i.id === sub.id ? { ...i, name: sub.toName, emoji: sub.toEmoji } : i));
      setAppliedSubs(prev => [...prev, sub.id]);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div style={{ fontFamily: "'Nunito', sans-serif", minHeight: "100vh", width: "100vw", background: theme.cream, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
        <div style={{ fontSize: 48 }}>🛒</div>
        <div style={{ fontWeight: 900, fontSize: 20, color: theme.charcoal }}>Your cart is empty</div>
        <p style={{ color: theme.gray, fontSize: 14 }}>Add items from the Home page first</p>
        <button onClick={() => setPage("home")} style={{ background: `linear-gradient(135deg, ${theme.green}, ${theme.greenDark})`, color: theme.white, border: "none", borderRadius: 12, padding: "12px 28px", fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 14, cursor: "pointer" }}>← Go Shopping</button>
        <BottomNav setPage={setPage} activePage="optimize" />
      </div>
    );
  }

  // Map stores to route pin positions
  const routeStores = strategy === "multi" && multiIsMultiple ? multiStores : [{ name: singleResult?.store, items: singleResult?.items || [], subtotal: singleTotal }];
  const pinPositions = [{ x: 60, y: 110 }, { x: 200, y: 65 }, { x: 360, y: 115 }, { x: 300, y: 45 }];

  return (
    <div style={{ fontFamily: "'Nunito', sans-serif", minHeight: "100vh", width: "100vw", background: theme.cream, paddingBottom: 80, boxSizing: "border-box", overflowX: "hidden" }}>

      {/* ── Top bar ── */}
      <div style={{ background: theme.white, borderBottom: `1.5px solid ${theme.grayBorder}`, padding: "16px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50, width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 46, height: 46, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            <img onClick={() => setPage("landing")} src="https://res.cloudinary.com/dojayxyvx/image/upload/v1772864715/cart_background-removebg-preview_gsl33k.png" style={{ width: "100%", height: "100%", objectFit: "cover", cursor: "pointer" }} />
          </div>
          <span onClick={() => setPage("landing")} style={{ fontSize: 20, fontWeight: 900, color: theme.charcoal, cursor: "pointer" }}>Cartly</span>
          <div style={{ width: 1, height: 28, background: theme.grayBorder }} />
          <div>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 900, color: theme.charcoal }}>Optimize Results ✦</h2>
            <p style={{ margin: 0, fontSize: 11, color: theme.gray }}>{cartItems.length} items · {currentMode.emoji} {currentMode.label} · Cheapest prices</p>
          </div>
        </div>
        {budgetDiff !== null && (
          <div style={{ background: underBudget ? theme.greenLight : "#FFF0EE", border: `1.5px solid ${underBudget ? theme.green : theme.red}`, borderRadius: 10, padding: "8px 16px", textAlign: "center" }}>
            <div style={{ fontSize: 11, color: underBudget ? theme.greenDark : theme.red, fontWeight: 700 }}>Budget ${budget}</div>
            <div style={{ fontSize: 14, fontWeight: 900, color: underBudget ? theme.greenDark : theme.red }}>
              {underBudget ? `$${budgetDiff} under ✓` : `$${Math.abs(budgetDiff)} over ✗`}
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: "24px 28px", display: "grid", gridTemplateColumns: "1fr 320px", gap: 22, width: "100%", boxSizing: "border-box" }}>

        {/* ── LEFT ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20, minWidth: 0 }}>

          {/* Strategy selector */}
          <div style={{ background: theme.white, borderRadius: 16, padding: "22px", border: `1.5px solid ${theme.grayBorder}` }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 900, color: theme.charcoal }}>🎯 Shopping Strategy</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>

              {/* Single store card */}
              <div onClick={() => setStrategy("single")} style={{ borderRadius: 14, padding: "18px", border: `2px solid ${strategy === "single" ? theme.greenDark : theme.grayBorder}`, background: strategy === "single" ? theme.greenLight : theme.cream, cursor: "pointer", transition: "all 0.15s" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: strategy === "single" ? theme.greenDark : theme.gray, textTransform: "uppercase", letterSpacing: "0.05em" }}>Single Store</div>
                  {strategy === "single" && <span style={{ fontSize: 11, background: theme.greenDark, color: theme.white, borderRadius: 20, padding: "2px 8px", fontWeight: 700 }}>Selected</span>}
                </div>
                <div style={{ fontSize: 28, fontWeight: 900, color: theme.charcoal }}>${singleTotal.toFixed(2)}</div>
                <div style={{ fontSize: 12, color: theme.gray, marginTop: 4 }}>{singleResult?.store} · 1 stop</div>
                {multiIsMultiple && (
                  <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 11, color: theme.greenDark, background: theme.greenMid, borderRadius: 8, padding: "3px 8px", fontWeight: 700 }}>⛽ ~{(multiStores.length * 1.4).toFixed(1)}L gas saved</span>
                    <span style={{ fontSize: 11, color: theme.greenDark, background: theme.greenMid, borderRadius: 8, padding: "3px 8px", fontWeight: 700 }}>🌱 ~{(multiStores.length * 3.2).toFixed(1)}kg CO₂</span>
                  </div>
                )}
              </div>

              {/* Multi store card */}
              <div onClick={() => setStrategy("multi")} style={{ borderRadius: 14, padding: "18px", border: `2px solid ${strategy === "multi" ? theme.greenDark : theme.grayBorder}`, background: strategy === "multi" ? theme.greenLight : theme.cream, cursor: "pointer", transition: "all 0.15s" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: strategy === "multi" ? theme.greenDark : theme.gray, textTransform: "uppercase", letterSpacing: "0.05em" }}>Best Multi-Store</div>
                  {strategy === "multi" && <span style={{ fontSize: 11, background: theme.greenDark, color: theme.white, borderRadius: 20, padding: "2px 8px", fontWeight: 700 }}>Selected</span>}
                </div>
                <div style={{ fontSize: 28, fontWeight: 900, color: theme.greenDark }}>${multiTotal.toFixed(2)}</div>
                <div style={{ fontSize: 12, color: theme.gray, marginTop: 4 }}>
                  {multiIsMultiple
                    ? `${multiStores.length} stores · Save $${multiSaving.toFixed(2)}`
                    : `${multiStores[0]?.name} · same as single store`}
                </div>
                {strategy === "multi" && (
                  <div style={{ marginTop: 12 }}>
                    {multiStores.map((s, i) => (
                      <div key={i} style={{ marginBottom: 8 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                          <span style={{ fontSize: 12, fontWeight: 800, color: theme.charcoal }}>{s.name}</span>
                          <span style={{ fontSize: 12, fontWeight: 800, color: theme.greenDark }}>${s.subtotal.toFixed(2)}</span>
                        </div>
                        {s.items.map((item, j) => (
                          <div key={j} style={{ fontSize: 11, color: theme.gray, paddingLeft: 8 }}>· {item.variantName || item.name} — ${item.price.toFixed(2)}</div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Route map */}
          <div style={{ background: theme.white, borderRadius: 16, padding: "22px", border: `1.5px solid ${theme.grayBorder}` }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 900, color: theme.charcoal }}>🗺 Shopping Route</h3>
            <div style={{ height: 160, borderRadius: 14, background: "#e8f4e8", position: "relative", overflow: "hidden", border: `1.5px solid ${theme.grayBorder}`, marginBottom: 16 }}>
              {[...Array(6)].map((_, i) => <div key={i} style={{ position: "absolute", left: 0, right: 0, top: `${(i+1)*14}%`, height: 1, background: "rgba(102,156,53,0.12)" }} />)}
              {[...Array(8)].map((_, i) => <div key={i} style={{ position: "absolute", top: 0, bottom: 0, left: `${(i+1)*12}%`, width: 1, background: "rgba(102,156,53,0.12)" }} />)}
              <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
                <polyline
                  points={routeStores.slice(0, 4).map((_, i) => `${pinPositions[i].x},${pinPositions[i].y}`).join(" ")}
                  stroke={theme.greenDark} strokeWidth="2.5" strokeDasharray="7,4" fill="none"
                />
              </svg>
              {routeStores.slice(0, 4).map((s, i) => (
                <div key={i} style={{ position: "absolute", left: pinPositions[i].x - 14, top: pinPositions[i].y - 14 }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: storeColors[s.name] || theme.greenDark, color: theme.white, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, boxShadow: "0 3px 10px rgba(0,0,0,0.2)" }}>{i + 1}</div>
                </div>
              ))}
              <div style={{ position: "absolute", bottom: 10, right: 12, background: "white", borderRadius: 8, padding: "4px 10px", fontSize: 11, fontWeight: 700, color: theme.charcoal, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
                {multiIsMultiple && strategy === "multi"
                  ? `~${(routeStores.length * 2.8).toFixed(1)} km · ${routeStores.length * 7} min`
                  : "~1.2 km · 5 min"}
              </div>
            </div>
            {routeStores.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderTop: i > 0 ? `1px solid ${theme.grayLight}` : "none" }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: storeColors[s.name] || theme.greenDark, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, color: theme.white, flexShrink: 0 }}>{i + 1}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: theme.charcoal }}>Stop {i + 1}: {s.name}</div>
                  <div style={{ fontSize: 11, color: theme.gray }}>{s.items.length} item{s.items.length !== 1 ? "s" : ""}</div>
                </div>
                <div style={{ fontWeight: 800, color: theme.greenDark, fontSize: 14 }}>${s.subtotal.toFixed(2)}</div>
              </div>
            ))}
          </div>

          {/* Smart substitutions */}
          <div style={{ background: theme.white, borderRadius: 16, padding: "22px", border: `1.5px solid ${theme.grayBorder}` }}>
            <h3 style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 900, color: theme.charcoal }}>🔄 Smart Substitutions</h3>
            <p style={{ margin: "0 0 16px", fontSize: 12, color: theme.gray }}>
              {loadingSubs ? "Analysing your cart..." : `${substitutions.length} swap${substitutions.length !== 1 ? "s" : ""} found · tap to apply and save`}
            </p>
            {loadingSubs ? (
              <div style={{ textAlign: "center", padding: "24px 0", color: theme.gray, fontSize: 13 }}>⏳ Finding best swaps...</div>
            ) : substitutions.length === 0 ? (
              <div style={{ textAlign: "center", padding: "20px", background: theme.cream, borderRadius: 12, border: `1.5px solid ${theme.grayBorder}` }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>✅</div>
                <div style={{ fontWeight: 700, fontSize: 13, color: theme.charcoal }}>No suggestions</div>
                <div style={{ fontSize: 12, color: theme.gray, marginTop: 4 }}>Your cart is already well optimized!</div>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {substitutions.map(sub => {
                  const applied = appliedSubs.includes(sub.id);
                  return (
                    <div key={sub.id} onClick={() => applySubstitution(sub)} style={{ background: applied ? theme.greenLight : "#FFF9F5", borderRadius: 14, padding: "16px", border: `1.5px solid ${applied ? theme.green : "#FFE5D5"}`, cursor: "pointer", transition: "all 0.15s" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                        <span style={{ fontSize: 26 }}>{applied ? sub.toEmoji : sub.fromEmoji}</span>
                        <span style={{ fontSize: 11, fontWeight: 800, color: applied ? theme.white : theme.greenDark, background: applied ? theme.greenDark : theme.greenMid, borderRadius: 8, padding: "2px 10px", display: "flex", alignItems: "center" }}>
                          Save ${sub.saveAmount.toFixed(2)}
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: theme.gray, textDecoration: "line-through", marginBottom: 3 }}>{sub.fromName}</div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: theme.charcoal }}>→ {sub.toName}</div>
                      <div style={{ fontSize: 11, color: theme.gray, marginTop: 4 }}>{sub.reason}</div>
                      <div style={{ marginTop: 8, fontSize: 11, fontWeight: 700, color: applied ? theme.greenDark : theme.gray }}>
                        {applied ? "✓ Applied — tap to undo" : "Tap to apply"}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT — cart summary ── */}
        <div>
          <div style={{ background: theme.white, borderRadius: 16, padding: "22px", border: `1.5px solid ${theme.grayBorder}`, position: "sticky", top: 70 }}>
            <h3 style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 900, color: theme.charcoal }}>
              🛒 {strategy === "single" ? "Single Store Cart" : "Optimized Cart"}
            </h3>
            <p style={{ margin: "0 0 14px", fontSize: 11, color: theme.gray }}>{currentMode.emoji} {currentMode.label} · Cheapest prices</p>

            <div style={{ display: "flex", flexDirection: "column", maxHeight: 340, overflowY: "auto", paddingRight: 4 }}>
              {activeItems.map((item, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderTop: i > 0 ? `1px solid ${theme.grayLight}` : "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 18 }}>{item.emoji}</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 12, color: theme.charcoal }}>{item.variantName || item.name}</div>
                      {item.store && <div style={{ fontSize: 10, color: theme.gray }}>{item.store}</div>}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: theme.charcoal }}>${(item.price * item.qty).toFixed(2)}</div>
                    {item.qty > 1 && <div style={{ fontSize: 10, color: theme.gray }}>×{item.qty} @ ${item.price.toFixed(2)}</div>}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ borderTop: `2px solid ${theme.grayBorder}`, marginTop: 12, paddingTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
              {totalSaved > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: theme.greenDark, fontWeight: 700 }}>
                  <span>🔄 Swap savings</span>
                  <span>−${totalSaved.toFixed(2)}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 800, fontSize: 14, color: theme.charcoal }}>Total</span>
                <span style={{ fontWeight: 900, fontSize: 22, color: theme.greenDark }}>${finalTotal.toFixed(2)}</span>
              </div>
              {multiIsMultiple && strategy === "multi" && multiSaving > 0 && (
                <div style={{ textAlign: "center", fontSize: 12, color: theme.greenDark, fontWeight: 700, background: theme.greenLight, borderRadius: 8, padding: "6px" }}>
                  💰 Saving ${multiSaving.toFixed(2)} vs single store
                </div>
              )}
              {budgetDiff !== null && (
                <div style={{ textAlign: "center", fontSize: 12, fontWeight: 700, borderRadius: 8, padding: "6px", background: underBudget ? theme.greenLight : "#FFF0EE", color: underBudget ? theme.greenDark : theme.red }}>
                  {underBudget
                    ? `✓ $${budgetDiff} under your $${budget} budget`
                    : `✗ $${Math.abs(budgetDiff)} over your $${budget} budget`}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <BottomNav setPage={setPage} activePage="optimize" />
    </div>
  );
}
