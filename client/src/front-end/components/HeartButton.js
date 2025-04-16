// src/front-end/components/FavoriteButton.js
import React from "react"
import { Heart, HeartOff } from "lucide-react";

const HeartButton = ({ recipeId, isFavorite, onToggle, className = "" }) => {
  return (
    <button
      onClick={() => onToggle(recipeId)}
      className={`p-2 rounded-full transition ${className}`}
      title={isFavorite ? "Unfavorite" : "Favorite"}
    >
      {isFavorite ? (
        <Heart fill="red-600" size={20} />
      ) : (
        <HeartOff size={20} />
      )}
    </button>
  );
};

export default HeartButton;

