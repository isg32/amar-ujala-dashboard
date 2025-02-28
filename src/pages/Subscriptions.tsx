import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { CreditCard, Check } from 'lucide-react';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  duration: number;
  features: string[];
}

const Subscriptions: React.FC = () => {
  const { currentUser } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  
  const subscriptionPlans: SubscriptionPlan[] = [
    {
      id: 'monthly',
      name: 'Monthly',
      price: 300,
      duration: 30,
      features: [
        'Daily newspaper delivery',
        'Access to e-paper',
        'Monthly billing',
        'Cancel anytime'
      ]
    },
    {
      id: 'quarterly',
      name: 'Quarterly',
      price: 850,
      duration: 90,
      features: [
        'Daily newspaper delivery',
        'Access to e-paper',
        'Quarterly billing',
        '5% discount on regular price',
        'Cancel anytime'
      ]
    },
    {
      id: 'yearly',
      name: 'Yearly',
      price: 3200,
      duration: 365,
      features: [
        'Daily newspaper delivery',
        'Access to e-paper',
        'Annual billing',
        '10% discount on regular price',
        'Premium customer support',
        'Cancel anytime'
      ]
    }
  ];

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handleSubscribe = async () => {
    if (!selectedPlan) return;
    
    // Here you would integrate with RazorPay
    // For now, we'll just show an alert
    alert(`Subscribing to ${selectedPlan} plan. RazorPay integration would happen here.`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Subscription Plans</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {subscriptionPlans.map((plan) => (
          <div 
            key={plan.id}
            className={`bg-white rounded-lg shadow-md overflow-hidden border-2 ${
              selectedPlan === plan.id ? 'border-blue-500' : 'border-transparent'
            }`}
          >
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{plan.name}</h2>
              <div className="flex items-baseline mb-4">
                <span className="text-3xl font-bold text-gray-900">₹{plan.price}</span>
                <span className="ml-1 text-gray-500">/{plan.duration} days</span>
              </div>
              
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button
                onClick={() => handleSelectPlan(plan.id)}
                className={`w-full py-2 px-4 rounded-md text-sm font-medium ${
                  selectedPlan === plan.id
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {selectedPlan === plan.id ? 'Selected' : 'Select Plan'}
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {selectedPlan && (
        <div className="bg-blue-50 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            You've selected the {subscriptionPlans.find(p => p.id === selectedPlan)?.name} plan
          </h2>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-4 sm:mb-0">
              <p className="text-gray-600">
                Total amount: <span className="font-semibold">₹{subscriptionPlans.find(p => p.id === selectedPlan)?.price}</span>
              </p>
              <p className="text-gray-600">
                Duration: <span className="font-semibold">{subscriptionPlans.find(p => p.id === selectedPlan)?.duration} days</span>
              </p>
            </div>
            
            <button
              onClick={handleSubscribe}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md text-sm font-medium flex items-center justify-center"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Subscribe Now
            </button>
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Subscription FAQs</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-md font-medium text-gray-900">How does the subscription work?</h3>
            <p className="text-gray-600 mt-1">
              Once you subscribe, you'll receive the newspaper daily at your doorstep for the duration of your subscription.
            </p>
          </div>
          
          <div>
            <h3 className="text-md font-medium text-gray-900">Can I cancel my subscription?</h3>
            <p className="text-gray-600 mt-1">
              Yes, you can cancel your subscription at any time. Refunds are processed on a pro-rata basis.
            </p>
          </div>
          
          <div>
            <h3 className="text-md font-medium text-gray-900">What payment methods are accepted?</h3>
            <p className="text-gray-600 mt-1">
              We accept all major credit/debit cards, UPI, and net banking through our secure payment gateway.
            </p>
          </div>
          
          <div>
            <h3 className="text-md font-medium text-gray-900">What if I don't receive my newspaper?</h3>
            <p className="text-gray-600 mt-1">
              You can report a missed delivery through the dashboard, and our team will address it promptly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscriptions;