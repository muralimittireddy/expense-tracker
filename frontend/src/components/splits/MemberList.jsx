import React, { useState, useEffect, useRef } from "react";
import Input from "../common/Input";
import Button from "../common/Button";
import axiosInstance from '../../api/axiosInstance';

// This function makes an API call to your backend to search for users.
const fetchUserSuggestions = async (emailQuery) => {
    try {
        const response = await axiosInstance.get(`/users/search?email=${encodeURIComponent(emailQuery)}`);
        return response.data;
    } catch (error) {
        console.error("Failed to fetch user suggestions:", error);
        throw error;
    }
};

// Simple email validation regex
const isValidEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
};

function MemberList({ memberInput, setMemberInput, newGroupMembers, addMember, removeMember }) {
    const [suggestions, setSuggestions] = useState([]);
    const [memberInputError, setMemberInputError] = useState(null);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const containerRef = useRef(null);

    // Debounce the search for suggestions
    useEffect(() => {
        const handler = setTimeout(async () => {
            if (memberInput.length > 2) {
                try {
                    const results = await fetchUserSuggestions(memberInput);
                    setSuggestions(results);
                    setShowSuggestions(true);
                    setMemberInputError(null);
                } catch (error) {
                    console.error("Failed to fetch user suggestions:", error);
                    setMemberInputError("Failed to fetch suggestions. Please try again.");
                    setSuggestions([]);
                    setShowSuggestions(false);
                }
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
                setMemberInputError(null);
            }
        }, 300);

        return () => {
            clearTimeout(handler);
        };
    }, [memberInput]);

    // Handle clicks outside the suggestions box
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleAddMember = async () => {
        const trimmedInput = memberInput.trim();
        if (!trimmedInput) {
            setMemberInputError("Email cannot be empty.");
            return;
        }
        if (!isValidEmail(trimmedInput)) {
            setMemberInputError("Please enter a valid email address.");
            return;
        }
        if (newGroupMembers.some(member => member.name === trimmedInput)) {
            setMemberInputError("This member has already been added.");
            return;
        }

        try {
            const results = await fetchUserSuggestions(trimmedInput);
            if (results.some(user => user.email === trimmedInput)) {
                setMemberInputError(null);
                addMember(trimmedInput);
                setSuggestions([]);
            } else {
                setMemberInputError("This user was not found. Please select from the suggestions or check the email.");
            }
        } catch (error) {
            console.error("Failed to validate member:", error);
            setMemberInputError("Failed to validate member. Please try again.");
        }
    };

    const handleSuggestionClick = (email) => {
        setMemberInput(email);
        setShowSuggestions(false);
    };

    const handleInputFocus = () => {
      if (suggestions.length > 0) {
        setShowSuggestions(true);
      }
    };

    return (
        <div ref={containerRef} className="relative">
            <label htmlFor="memberInput" className="block text-sm font-medium text-gray-700">
                Add Members
            </label>
            <div className="mt-1 flex space-x-2">
                <Input
                    id="memberInput"
                    name="memberInput"
                    type="email"
                    value={memberInput}
                    onChange={(e) => setMemberInput(e.target.value)}
                    onFocus={handleInputFocus}
                    placeholder="Add Member by Email"
                />
                <Button type="button" onClick={handleAddMember} variant="secondary">
                    Add
                </Button>
            </div>
            {memberInputError && <p className="mt-1 text-sm text-red-500">{memberInputError}</p>}
            {showSuggestions && suggestions.length > 0 && (
                <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-40 overflow-y-auto">
                    {suggestions.map((user, index) => (
                        <li
                            key={index}
                            onClick={() => handleSuggestionClick(user.email)}
                            className="p-2 cursor-pointer hover:bg-gray-100 text-sm"
                        >
                            {user.email}
                        </li>
                    ))}
                </ul>
            )}
            {newGroupMembers.length > 0 && (
                <ul className="mt-4 space-y-2">
                    {newGroupMembers.map((member, index) => (
                        <li key={index} className="flex justify-between items-center bg-gray-100 p-2 rounded-md">
                            <span className="text-gray-800">{member}</span>
                            <Button type="button" variant="danger" size="sm" onClick={() => removeMember(index)}>
                                &times;
                            </Button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default MemberList;
