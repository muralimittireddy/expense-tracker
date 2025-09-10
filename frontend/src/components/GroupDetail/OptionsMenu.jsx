import React, {useState} from "react";
import axiosInstance from "../../api/axiosInstance";

function OptionsMenu({toggleOptionsMenu,groupId,groupDetails})
{
  const [email,setEmail]=useState('');
  const [isAddingMember,setIsAddingMember]=useState(false);
  const [message, setMessage] = useState('');

  const handleAddMember = async() =>
  {
    setMessage('');

    if (!email) {
      setMessage('Please enter a valid email address.');
      return;
    }

     try {
      const response = await axiosInstance.post(
        `/splits/groups/addMember`, // Replace with your backend URL
        { id:groupId,email: email }
      );
      
      // 3. Handle success
      console.log('Member added successfully:', response.data);
      setMessage('Member added successfully!');
      setEmail(''); // Clear the input field
      setIsAddingMember(false);
    } catch (error) {
      // 4. Handle errors
      console.error('Failed to add member:', error.response.data.detail);
      setMessage(`Error: ${error.response.data.detail}`);
    }


  }

    return (
        <div className="absolute top-full right-0 mt-4 w-72 bg-white rounded-lg shadow-xl z-10 p-4 border border-gray-200">
      {/* Close button */}
      <div className="flex justify-end">
        <button onClick={toggleOptionsMenu} className="text-gray-400 hover:text-gray-600 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Menu items */}
      <ul className="flex flex-col space-y-2">
        {message && (
          <li className={`p-2 rounded-md ${message.startsWith('Error') ? 'text-red-500 bg-red-100' : 'text-green-500 bg-green-100'}`}>
            {message}
          </li>
        )}
        {!isAddingMember ? (
        <li className="p-2 hover:bg-gray-100 rounded-md cursor-pointer transition-colors" onClick={() => setIsAddingMember(true)}>Add Member</li>):(
        <>
         <li className="p-2">
              <input
                type="email"
                placeholder="Enter member's email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </li>
            <li
              className="p-2 bg-indigo-500 text-white text-center rounded-md cursor-pointer hover:bg-indigo-600 transition-colors"
              onClick={handleAddMember}
            >
              Confirm
            </li>
          </>
        )}
        <li className="p-2 hover:bg-gray-100 rounded-md cursor-pointer transition-colors text-red-500">Leave Group</li>
        <li className="pt-2">
          <p className="font-bold text-sm text-gray-500 mb-1">Group Members</p>
          <ul className="space-y-1">
            {groupDetails?.usernames?.map((username, index) => (
              <li key={index} className="text-gray-700">
                {username}
              </li>
            ))}
        </ul>
        </li>
      </ul>
    </div>
    );
}

export default OptionsMenu;