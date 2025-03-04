import React, { useState, useEffect } from "react";
import useDebounce from "../hooks/useDebounce";
import "rc-slider/assets/index.css";
import { categories } from "../data/searchSetting";

function StickySearchInput({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  hits,
  resetFilters
}) {
  const [inputValue, setInputValue] = useState(searchTerm); // Initialize with passed searchTerm
  const debouncedSearchTerm = useDebounce(inputValue, 800); // Debounce the input by 800ms
  const debouncedHitsVisibility = useDebounce(inputValue, 500); // Separate debounce for hits visibility
  const [showHits, setShowHits] = useState(false); // Control visibility of hits

  // Update searchTerm when debouncedSearchTerm changes
  useEffect(() => {
    setSearchTerm(debouncedSearchTerm);
  }, [debouncedSearchTerm, setSearchTerm]);

  // Sync inputValue with external searchTerm changes
  useEffect(() => {
    setInputValue(searchTerm);
  }, [searchTerm]);

  // Handle hits visibility with debounce
  useEffect(() => {
    if (debouncedHitsVisibility) {
      setShowHits(true); // Show hits after user stops typing
    } else {
      setShowHits(false); // Hide hits if search term is empty
    }
  }, [debouncedHitsVisibility]);

  const handleInputChange = (event) => {
    setInputValue(event.target.value); // Update local state on input change
    setShowHits(false); // Immediately hide hits while typing
  };

  const handleRemoveFilter = (filterKey) => {
    const updatedCategories = { ...selectedCategory };
    delete updatedCategories[filterKey];
    setSelectedCategory(updatedCategories);
  };

  const capitalize = (str) => {
    if (typeof str !== "string") return str;
    if (str.includes("Types")) {
      str = str.replace("Types", "").trim();
    }
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const renderInput = (group, items) => {
    switch (group) {
      case "Topics":
      case "contentTypes":
      case "mediaTypes":
      case "institutions":
        return (
          <select
            value={selectedCategory[group] || ""}
            onChange={(e) =>
              setSelectedCategory({
                ...selectedCategory,
                [group]: e.target.value
              })
            }
            style={{
              marginBottom: "10px",
              padding: "5px 10px",
              width: "100%",
              fontSize: "1rem",
              borderRadius: "15px",
              height: "34px",
              outline: "none",
              border: "1px solid #ccc",
              backgroundColor: "#fff",
              color: "#333",
              cursor: "pointer"
            }}>
            <option value="">{capitalize(group)}</option>
            {items.map((item, index) => (
              <option key={index} value={item}>
                {capitalize(item)}
              </option>
            ))}
          </select>
        );
      case "State":
      case "Years":
        return (
          <select
            value={selectedCategory[group] || ""}
            onChange={(e) =>
              setSelectedCategory({
                ...selectedCategory,
                [group]: e.target.value
              })
            }
            style={{
              marginBottom: "10px",
              padding: "5px 10px",
              width: "100%",
              fontSize: "1rem",
              borderRadius: "15px",
              height: "34px",
              outline: "none",
              border: "1px solid #ccc",
              backgroundColor: "#fff",
              color: "#333",
              cursor: "pointer"
            }}>
            <option value="">{group}</option>
            {items.map((item, index) => (
              <option key={index} value={item}>
                {item}
              </option>
            ))}
          </select>
        );
      default:
        return null;
    }
  };

  const renderActiveFilterButtons = () => {
    return Object.entries(selectedCategory)
      .filter(([key, value]) => value)
      .map(([key, value]) => (
        <button
          key={key}
          onClick={() => handleRemoveFilter(key)}
          style={{
            padding: "4px 8px",
            backgroundColor: "white",
            color: "gray",
            border: "gray 0.3px solid",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "0.85rem"
          }}>
          {`${key}: ${value}`} ×
        </button>
      ));
  };

  return (
    <div
      style={{
        position: "sticky",
        top: 80,
        zIndex: 900,
        backgroundColor: "white",
        padding: "10px 15px",
        width: "100%"
      }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          position: "relative",
          width: "100%",
          marginBottom: "20px"
        }}>
        <input
          type="search"
          value={inputValue} // Controlled by local state
          onChange={handleInputChange}
          placeholder="Search..."
          aria-label="Search"
          style={{
            width: "100%",
            padding: "10px 10px 10px 40px",
            borderRadius: "5px",
            border: "1px solid #ccc"
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "10px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "#ccc",
            pointerEvents: "none"
          }}
          aria-hidden="true">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            fill="currentColor"
            viewBox="0 0 16 16">
            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
          </svg>
        </div>
      </div>

      <div
        style={{
          marginTop: "10px",
          width: "100%",
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          gap: "1rem",
          listStyle: "none",
          visibility: inputValue === "" ? "hidden" : "visible", // Hide filters
          pointerEvents: inputValue === "" ? "none" : "auto", // Disable interaction
          height: inputValue === "" ? "0" : "auto", // Collapse the height
          overflow: "hidden", // Ensure no content is shown when hidden
          transition: "height 0.3s ease-in-out, opacity 0.3s ease-in-out", // Smooth transition
          opacity: inputValue === "" ? 0 : 1 // Fade effect
        }}>
        {Object.entries(categories).map(([group, items]) => (
          <div
            key={group}
            style={{
              flex: "1",
              minWidth: "120px",
              marginRight: "5px",
              paddingRight: "5px",
              width: "100%"
            }}>
            {renderInput(group, items)}
          </div>
        ))}
      </div>
      {hits > 0 && showHits && (
        <small>
          {hits} results found for {searchTerm}{" "}
        </small>
      )}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          gap: "10px",
          margin: "10px 0"
        }}>
        {renderActiveFilterButtons()}
        {Object.keys(selectedCategory).some((key) => selectedCategory[key]) && (
          <button
            onClick={resetFilters}
            style={{
              padding: "4px 8px",
              backgroundColor: "white",
              color: "gray",
              border: "gray 0.3px solid",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "0.85rem"
            }}>
            Clear All Filters
          </button>
        )}
      </div>
    </div>
  );
}

export default StickySearchInput;
