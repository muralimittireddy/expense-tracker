import React, { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";

// The SplitExpenseModal component handles the multi-step form for splitting an expense.
function SplitExpenseModal({ onClose , groupDetails, group}) {
  // State management for the modal's steps and data.
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [splitMethod, setSplitMethod] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [memberSplits, setMemberSplits] = useState({});
  console.log(groupDetails);

  // Mock member data. In a real application, this would be fetched from a backend.
  const members = groupDetails.users;
  const  groupId=group.id;

  // Effect hook to automatically calculate and set initial splits when the split method or members change.
  useEffect(() => {
    const total = parseFloat(amount);
    const n = selectedMembers.length;

    if (!splitMethod || !total || n === 0) return;

    // Reset splits when method changes
    let newSplits = {};

    if (splitMethod === "Evenly") {
      const share = total / n;
      selectedMembers.forEach((id) => {
        newSplits[id] = { amount: share.toFixed(2) };
      });
    } else if (splitMethod === "Amount") {
      selectedMembers.forEach((id) => {
        newSplits[id] = { amount: "" };
      });
    } else if (splitMethod === "Shares") {
      selectedMembers.forEach((id) => {
        newSplits[id] = { shares: "" };
      });
    } else if (splitMethod === "Percentage") {
      selectedMembers.forEach((id) => {
        newSplits[id] = { percentage: "" };
      });
    }

    setMemberSplits(newSplits);
  }, [splitMethod, selectedMembers, amount]);


  // Toggles a member's selection status.
  const toggleMember = (id) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  // Updates the split value for a specific member.
  const updateSplit = (userId, field, value) => {
    const total = parseFloat(amount);
    if (isNaN(total)) return;

    let newSplits = { ...memberSplits };
    newSplits[userId] = { ...newSplits[userId], [field]: value };

    // Special logic for the 'Amount' split method to ensure the total is correct.
    if (splitMethod === "Amount" && selectedMembers.length > 0) {
      const lastMemberId = selectedMembers[selectedMembers.length - 1];
      const otherMembersAmountSum = selectedMembers.reduce((sum, id) => {
        // Exclude the last member from the sum calculation.
        if (id !== lastMemberId) {
          const splitAmount = parseFloat(newSplits[id]?.amount || 0);
          return sum + splitAmount;
        }
        return sum;
      }, 0);

      const remainingAmount = total - otherMembersAmountSum;
      // Update the last member's amount with the remaining value.
      newSplits[lastMemberId] = { amount: remainingAmount.toFixed(2) };
    }

    setMemberSplits(newSplits);
  };

  // Calculates the final shares based on the selected method.
  const calculateShares = () => {
    const total = parseFloat(amount);
    const n = selectedMembers.length;
    if (!total || n === 0) return [];

    if (splitMethod === "Evenly") {
      const share = total / n;
      return selectedMembers.map((id) => ({
        user_id: id,
        share_amount: share,
      }));
    }

    if (splitMethod === "Amount") {
      return selectedMembers.map((id) => ({
        user_id: id,
        share_amount: parseFloat(memberSplits[id]?.amount || 0),
      }));
    }

    if (splitMethod === "Shares") {
      const totalShares = selectedMembers.reduce(
        (sum, id) => sum + parseFloat(memberSplits[id]?.shares || 0),
        0
      );
      return selectedMembers.map((id) => {
        const s = parseFloat(memberSplits[id]?.shares || 0);
        return { user_id: id, share_amount: (s / totalShares) * total };
      });
    }

    if (splitMethod === "Percentage") {
      return selectedMembers.map((id) => {
        const p = parseFloat(memberSplits[id]?.percentage || 0);
        return { user_id: id, share_amount: (p / 100) * total };
      });
    }

    return [];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-md relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          ✖
        </button>

        {/* Step 1: Enter expense details */}
        {step === 1 && (
          <div>
            <h2 className="text-lg font-bold mb-4 text-gray-800">
              Enter Expense Details
            </h2>
            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border p-2 mb-3 rounded-lg"
            />
            <input
              type="text"
              placeholder="For what?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border p-2 mb-3 rounded-lg"
            />
            <button
              onClick={() => setStep(2)}
              disabled={!amount || !description}
              className="w-full bg-blue-600 text-white py-2 rounded-lg shadow hover:bg-blue-700 disabled:bg-gray-400"
            >
              Next
            </button>
          </div>
        )}

        {/* Step 2: Select Members */}
        {step === 2 && (
          <div>
            <h2 className="text-lg font-bold mb-4 text-gray-800">
              Select Members
            </h2>
            {members.map((m) => (
              <button
                key={m.id}
                onClick={() => toggleMember(m.id)}
                className={`w-full p-2 mb-2 border rounded-lg shadow-sm hover:bg-blue-100 ${
                  selectedMembers.includes(m.id) ? "bg-blue-200" : ""
                }`}
              >
                {m.username}
              </button>
            ))}
            <div className="flex justify-between mt-4">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 border rounded-lg shadow"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={selectedMembers.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 disabled:bg-gray-400"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Choose Split Method */}
        {step === 3 && (
          <div>
            <h2 className="text-lg font-bold mb-4 text-gray-800">
              Choose Split Method
            </h2>
            {["Evenly", "Amount", "Shares", "Percentage"].map((method) => (
              <button
                key={method}
                onClick={() => setSplitMethod(method)}
                className={`w-full p-2 mb-2 border rounded-lg shadow-sm hover:bg-blue-100 ${
                  splitMethod === method ? "bg-blue-200" : ""
                }`}
              >
                {method}
              </button>
            ))}

            {/* Member inputs based on split method */}
            {splitMethod && (
              <div className="mt-4">
                {selectedMembers.map((id, index) => {
                  const member = members.find((m) => m.id === id);
                  const isLastMember = index === selectedMembers.length - 1;
                  return (
                    <div key={id} className="flex items-center gap-2 mb-2">
                      <span className="w-24 text-gray-700 font-medium">{member.name}</span>
                      {splitMethod === "Evenly" && (
                        <input
                          type="number"
                          value={memberSplits[id]?.amount || ""}
                          readOnly
                          className="border p-1 rounded w-28 bg-gray-100 text-gray-600"
                        />
                      )}
                      {splitMethod === "Amount" && (
                        <input
                          type="number"
                          placeholder="Amount"
                          value={memberSplits[id]?.amount || ""}
                          onChange={(e) => updateSplit(id, "amount", e.target.value)}
                          className="border p-1 rounded w-28"
                          readOnly={isLastMember}
                        />
                      )}
                      {splitMethod === "Shares" && (
                        <input
                          type="number"
                          placeholder="Shares"
                          value={memberSplits[id]?.shares || ""}
                          onChange={(e) => updateSplit(id, "shares", e.target.value)}
                          className="border p-1 rounded w-20"
                        />
                      )}
                      {splitMethod === "Percentage" && (
                        <input
                          type="number"
                          placeholder="%"
                          value={memberSplits[id]?.percentage || ""}
                          onChange={(e) => updateSplit(id, "percentage", e.target.value)}
                          className="border p-1 rounded w-16"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex justify-between mt-4">
              <button
                onClick={() => setStep(2)}
                className="px-4 py-2 border rounded-lg shadow"
              >
                Back
              </button>
              <button
                onClick={async () => {
                  const shares = calculateShares();
                  const payload = {
                                    description,
                                    amount: parseFloat(amount),
                                    selectedMembers,
                                    splitMethod,
                                    shares,
                                  };
                  console.log({
                    groupId,
                    description,
                    amount,
                    selectedMembers,
                    splitMethod,
                    shares,
                  });
                  try {
                    const response = await axiosInstance.post(
                      `/splits/groups/${groupId}/expenses`,
                      payload
                    );

                    // ✅ Axios automatically parses JSON
                    console.log("✅ Expense created:", response.data);
                  } catch (err) {
                    console.error("❌ Failed to create expense", err);
                  }
                  
                  onClose();
                }}
                disabled={!splitMethod || selectedMembers.length === 0}
                className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 disabled:bg-gray-400"
              >
                Confirm
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SplitExpenseModal;
