import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/config';
import { format } from 'date-fns';
import { Calendar, Newspaper, CreditCard, AlertCircle } from 'lucide-react';

interface Delivery {
  id: string;
  date: Date;
  status: 'delivered' | 'missed';
}

interface Payment {
  id: string;
  date: Date;
  amount: number;
  method: string;
  status: string;
}

interface Subscription {
  id: string;
  plan: string;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'expired';
  daysLeft: number;
}

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [recentDeliveries, setRecentDeliveries] = useState<Delivery[]>([]);
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!currentUser) return;

      try {
        // Fetch recent deliveries
        const deliveriesQuery = query(
          collection(db, 'deliveries'),
          where('userId', '==', currentUser.uid),
          orderBy('date', 'desc'),
          limit(7)
        );
        const deliveriesSnapshot = await getDocs(deliveriesQuery);
        const deliveriesData = deliveriesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date.toDate()
        })) as Delivery[];
        setRecentDeliveries(deliveriesData);

        // Fetch recent payments
        const paymentsQuery = query(
          collection(db, 'payments'),
          where('userId', '==', currentUser.uid),
          orderBy('date', 'desc'),
          limit(5)
        );
        const paymentsSnapshot = await getDocs(paymentsQuery);
        const paymentsData = paymentsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date.toDate()
        })) as Payment[];
        setRecentPayments(paymentsData);

        // Fetch active subscription
        const subscriptionsQuery = query(
          collection(db, 'subscriptions'),
          where('userId', '==', currentUser.uid),
          where('status', '==', 'active'),
          limit(1)
        );
        const subscriptionsSnapshot = await getDocs(subscriptionsQuery);
        
        if (!subscriptionsSnapshot.empty) {
          const subData = subscriptionsSnapshot.docs[0].data();
          const endDate = subData.endDate.toDate();
          const today = new Date();
          const daysLeft = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          
          setSubscription({
            id: subscriptionsSnapshot.docs[0].id,
            ...subData,
            startDate: subData.startDate.toDate(),
            endDate: endDate,
            daysLeft: daysLeft > 0 ? daysLeft : 0
          } as Subscription);
        }

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Mock data for demonstration
  const mockDeliveries: Delivery[] = recentDeliveries.length > 0 ? recentDeliveries : [
    { id: '1', date: new Date(), status: 'delivered' },
    { id: '2', date: new Date(Date.now() - 86400000), status: 'delivered' },
    { id: '3', date: new Date(Date.now() - 86400000 * 2), status: 'delivered' },
    { id: '4', date: new Date(Date.now() - 86400000 * 3), status: 'missed' },
    { id: '5', date: new Date(Date.now() - 86400000 * 4), status: 'delivered' },
    { id: '6', date: new Date(Date.now() - 86400000 * 5), status: 'delivered' },
    { id: '7', date: new Date(Date.now() - 86400000 * 6), status: 'delivered' }
  ];

  const mockPayments: Payment[] = recentPayments.length > 0 ? recentPayments : [
    { id: '1', date: new Date(Date.now() - 86400000 * 2), amount: 300, method: 'RazorPay', status: 'completed' },
    { id: '2', date: new Date(Date.now() - 86400000 * 10), amount: 300, method: 'Cash', status: 'completed' }
  ];

  const mockSubscription: Subscription = subscription || {
    id: '1',
    plan: 'Monthly',
    startDate: new Date(Date.now() - 86400000 * 10),
    endDate: new Date(Date.now() + 86400000 * 20),
    status: 'active',
    daysLeft: 20
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Dashboard</h1>
      
      {/* Subscription Status */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Subscription Status</h2>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            mockSubscription.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {mockSubscription.status === 'active' ? 'Active' : 'Expired'}
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Newspaper className="h-5 w-5 text-blue-500 mr-2" />
              <span className="text-sm font-medium text-gray-500">Plan</span>
            </div>
            <p className="mt-1 text-lg font-semibold">{mockSubscription.plan}</p>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-blue-500 mr-2" />
              <span className="text-sm font-medium text-gray-500">Valid Till</span>
            </div>
            <p className="mt-1 text-lg font-semibold">
              {format(mockSubscription.endDate, 'dd MMM yyyy')}
            </p>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-blue-500 mr-2" />
              <span className="text-sm font-medium text-gray-500">Days Left</span>
            </div>
            <p className="mt-1 text-lg font-semibold">{mockSubscription.daysLeft} days</p>
          </div>
        </div>
        
        <div className="mt-4">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
            Renew Subscription
          </button>
        </div>
      </div>
      
      {/* Recent Deliveries */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Deliveries</h2>
        
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {mockDeliveries.map((delivery) => (
            <div 
              key={delivery.id}
              className={`flex-shrink-0 w-14 h-14 rounded-lg flex flex-col items-center justify-center ${
                delivery.status === 'delivered' ? 'bg-green-100' : 'bg-red-100'
              }`}
            >
              <span className="text-xs font-medium">
                {format(delivery.date, 'dd')}
              </span>
              <span className="text-xs">
                {format(delivery.date, 'MMM')}
              </span>
              <div className={`w-2 h-2 rounded-full mt-1 ${
                delivery.status === 'delivered' ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 flex justify-between items-center text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
            <span className="text-gray-600">Delivered</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
            <span className="text-gray-600">Missed</span>
          </div>
          <a href="#" className="text-blue-600 hover:text-blue-800">View All</a>
        </div>
      </div>
      
      {/* Recent Payments */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Payments</h2>
        
        {mockPayments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mockPayments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(payment.date, 'dd MMM yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ₹{payment.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.method}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500">No recent payments found.</p>
          </div>
        )}
        
        <div className="mt-4 flex justify-between">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center">
            <CreditCard className="h-4 w-4 mr-2" />
            Make Payment
          </button>
          <a href="#" className="text-blue-600 hover:text-blue-800 text-sm flex items-center">
            View All Payments
          </a>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;