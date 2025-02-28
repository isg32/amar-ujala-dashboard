import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { collection, query, getDocs, doc, updateDoc, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { format } from 'date-fns';
import { Users, CreditCard, Newspaper, Calendar, Search } from 'lucide-react';

interface User {
  id: string;
  phoneNumber: string;
  role: string;
  createdAt: Date;
}

interface Subscription {
  id: string;
  userId: string;
  userPhone: string;
  plan: string;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'expired';
}

interface Delivery {
  id: string;
  userId: string;
  userPhone: string;
  date: Date;
  status: 'delivered' | 'missed';
}

const AdminPanel: React.FC = () => {
  const { currentUser, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'subscriptions' | 'deliveries'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchAdminData = async () => {
      if (!currentUser || !isAdmin) return;

      try {
        setLoading(true);
        
        // Fetch users
        const usersQuery = query(collection(db, 'users'));
        const usersSnapshot = await getDocs(usersQuery);
        const usersData = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date()
        })) as User[];
        setUsers(usersData);
        
        // Fetch subscriptions
        const subscriptionsQuery = query(collection(db, 'subscriptions'));
        const subscriptionsSnapshot = await getDocs(subscriptionsQuery);
        const subscriptionsData = subscriptionsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          startDate: doc.data().startDate.toDate(),
          endDate: doc.data().endDate.toDate()
        })) as Subscription[];
        setSubscriptions(subscriptionsData);
        
        // Fetch deliveries
        const deliveriesQuery = query(collection(db, 'deliveries'));
        const deliveriesSnapshot = await getDocs(deliveriesQuery);
        const deliveriesData = deliveriesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date.toDate()
        })) as Delivery[];
        setDeliveries(deliveriesData);
        
      } catch (error) {
        console.error("Error fetching admin data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [currentUser, isAdmin]);

  const handleMarkDelivery = async (userId: string, userPhone: string, status: 'delivered' | 'missed') => {
    try {
      const newDelivery = {
        userId,
        userPhone,
        date: Timestamp.now(),
        status
      };
      
      await addDoc(collection(db, 'deliveries'), newDelivery);
      
      // Refresh deliveries
      const updatedDeliveries = [...deliveries, {
        id: 'temp-id', // This will be replaced when we refresh the data
        ...newDelivery,
        date: new Date()
      }];
      
      setDeliveries(updatedDeliveries);
      
      alert(`Marked as ${status} for user ${userPhone}`);
    } catch (error) {
      console.error("Error marking delivery:", error);
      alert("Failed to mark delivery. Please try again.");
    }
  };

  // Mock data for demonstration
  const mockUsers: User[] = users.length > 0 ? users : [
    { id: '1', phoneNumber: '+919876543210', role: 'user', createdAt: new Date(Date.now() - 86400000 * 30) },
    { id: '2', phoneNumber: '+919876543211', role: 'user', createdAt: new Date(Date.now() - 86400000 * 20) },
    { id: '3', phoneNumber: '+919876543212', role: 'admin', createdAt: new Date(Date.now() - 86400000 * 60) }
  ];

  const mockSubscriptions: Subscription[] = subscriptions.length > 0 ? subscriptions : [
    { 
      id: '1', 
      userId: '1', 
      userPhone: '+919876543210', 
      plan: 'Monthly', 
      startDate: new Date(Date.now() - 86400000 * 10), 
      endDate: new Date(Date.now() + 86400000 * 20), 
      status: 'active' 
    },
    { 
      id: '2', 
      userId: '2', 
      userPhone: '+919876543211', 
      plan: 'Quarterly', 
      startDate: new Date(Date.now() - 86400000 * 30), 
      endDate: new Date(Date.now() + 86400000 * 60), 
      status: 'active' 
    }
  ];

  const mockDeliveries: Delivery[] = deliveries.length > 0 ? deliveries : [
    { id: '1', userId: '1', userPhone: '+919876543210', date: new Date(), status: 'delivered' },
    { id: '2', userId: '1', userPhone: '+919876543210', date: new Date(Date.now() - 86400000), status: 'delivered' },
    { id: '3', userId: '2', userPhone: '+919876543211', date: new Date(), status: 'missed' }
  ];

  const filteredUsers = mockUsers.filter(user => 
    user.phoneNumber.includes(searchQuery)
  );

  const filteredSubscriptions = mockSubscriptions.filter(sub => 
    sub.userPhone.includes(searchQuery)
  );

  const filteredDeliveries = mockDeliveries.filter(delivery => 
    delivery.userPhone.includes(searchQuery)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Admin Panel</h1>
      
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Search by phone number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('users')}
            className={`${
              activeTab === 'users'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <Users className="h-5 w-5 mr-2" />
            Users
          </button>
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`${
              activeTab === 'subscriptions'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <CreditCard className="h-5 w-5 mr-2" />
            Subscriptions
          </button>
          <button
            onClick={() => setActiveTab('deliveries')}
            className={`${
              activeTab === 'deliveries'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <Newspaper className="h-5 w-5 mr-2" />
            Deliveries
          </button>
        </nav>
      </div>
      
      {/* Content based on active tab */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {activeTab === 'users' && (
          <div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined On
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.phoneNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(user.createdAt, 'dd MMM yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button className="text-blue-600 hover:text-blue-900 mr-3">
                          View Details
                        </button>
                        <button 
                          className="text-green-600 hover:text-green-900 mr-3"
                          onClick={() => handleMarkDelivery(user.id, user.phoneNumber, 'delivered')}
                        >
                          Mark Delivered
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-900"
                          onClick={() => handleMarkDelivery(user.id, user.phoneNumber, 'missed')}
                        >
                          Mark Missed
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {activeTab === 'subscriptions' && (
          <div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Start Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      End Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSubscriptions.map((subscription) => (
                    <tr key={subscription.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {subscription.userPhone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {subscription.plan}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(subscription.startDate, 'dd MMM yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(subscription.endDate, 'dd MMM yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          subscription.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {subscription.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button className="text-blue-600 hover:text-blue-900 mr-3">
                          Extend
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          Cancel
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {activeTab === 'deliveries' && (
          <div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDeliveries.map((delivery) => (
                    <tr key={delivery.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {delivery.userPhone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(delivery.date, 'dd MMM yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          delivery.status === 'delivered' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {delivery.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button className="text-blue-600 hover:text-blue-900">
                          Change Status
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="p-4 border-t border-gray-200">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Bulk Update Deliveries
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;