import React, { useState } from 'react';
import { Ship, TrendingUp, Package, AlertCircle, Plus, Trash2, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
interface CargoItem {
  name: string;
  weight: number;
  profit: number;
  color: string;
  ratio?: number;
  amount?: number;
  fractional?: boolean;
  fraction?: string;
}


const FractionalKnapsackDemo = () => {
  const [step, setStep] = useState(0);
  const [approach, setApproach] = useState<string>("greedy");
  const [capacity, setCapacity] = useState<number>(50);
  const [cargo, setCargo] = useState<CargoItem[]>([]);
  const [showSimulation, setShowSimulation] = useState(false);

  const [newCargo, setNewCargo] = useState({
    name: "",
    weight: "",
    profit: ""
});



  const loadSampleData = () => {
    setCargo([
      { name: 'Copper Coils', weight: 10, profit: 60, color: 'bg-orange-500' },
      { name: 'Rice Bags', weight: 20, profit: 100, color: 'bg-amber-500' },
      { name: 'Machinery Parts', weight: 15, profit: 75, color: 'bg-blue-500' },
      { name: 'Cement Blocks', weight: 30, profit: 120, color: 'bg-gray-500' }
    ]);
    setCapacity(50);
  };

  const colors = [
    'bg-orange-500', 'bg-amber-500', 'bg-blue-500', 'bg-gray-500',
    'bg-purple-500', 'bg-pink-500', 'bg-green-500', 'bg-red-500'
  ];

  const addCargo = () => {
  if (newCargo.name && newCargo.weight && newCargo.profit) {
    setCargo(prev => [
      ...prev,
      {
        name: newCargo.name,
        weight: parseFloat(newCargo.weight),
        profit: parseFloat(newCargo.profit),
        color: colors[prev.length % colors.length],
      },
    ]);
    setNewCargo({ name: '', weight: '', profit: '' });
  }
};


  const removeCargo = (index) => {
    setCargo(cargo.filter((_, i) => i !== index));
  };

  const startSimulation = () => {
    if (cargo.length > 0 && capacity > 0) {
      setShowSimulation(true);
      setStep(0);
    }
  };

  const backToInput = () => {
    setShowSimulation(false);
    setStep(0);
  };

  // Calculate greedy solution
  const calculateGreedySolution = () => {
    const cargoWithRatio = cargo.map(item => ({
      ...item,
      ratio: item.profit / item.weight
    })).sort((a, b) => b.ratio - a.ratio);

    const steps = [
      { 
        title: "Initial Setup",
        desc: `Ship capacity: ${capacity} tons | Calculate profit-to-weight ratios`,
        loaded: [],
        remaining: capacity,
        totalProfit: 0
      }
    ];

    let remaining = capacity;
    let totalProfit = 0;
    let loaded = [];
    let stepNum = 1;

    for (let i = 0; i < cargoWithRatio.length; i++) {
      const item = cargoWithRatio[i];
      
      if (remaining >= item.weight) {
        // Take full item
        loaded.push({ ...item, amount: item.weight, fractional: false });
        remaining -= item.weight;
        totalProfit += item.profit;
        
        steps.push({
          title: `Step ${stepNum}: Add ${item.name}`,
          desc: `Ratio: ${item.ratio.toFixed(1)} | Adding ${item.weight} tons`,
          loaded: [...loaded],
          remaining: remaining,
          totalProfit: totalProfit
        });
        stepNum++;
      } else if (remaining > 0) {
        // Take fraction
        const fraction = remaining / item.weight;
        const fractionalProfit = item.profit * fraction;
        loaded.push({ 
          ...item, 
          amount: remaining, 
          fractional: true, 
          fraction: `${remaining.toFixed(1)}/${item.weight}`
        });
        totalProfit += fractionalProfit;
        
        steps.push({
          title: `Step ${stepNum}: Partial ${item.name}`,
          desc: `Only ${remaining.toFixed(1)} tons left! Take ${(fraction * 100).toFixed(1)}% of ${item.name}`,
          loaded: [...loaded],
          remaining: 0,
          totalProfit: totalProfit
        });
        remaining = 0;
        break;
      }
    }

    return steps;
  };

  // Calculate random solution (takes first items until full)
  const calculateRandomSolution = () => {
    const steps = [
      {
        title: "Initial Setup",
        desc: `Ship capacity: ${capacity} tons | No calculation, just loading!`,
        loaded: [],
        remaining: capacity,
        totalProfit: 0
      }
    ];

    let remaining = capacity;
    let totalProfit = 0;
    let loaded = [];
    let stepNum = 1;

    for (let i = 0; i < cargo.length && remaining > 0; i++) {
      const item = cargo[i];
      
      if (remaining >= item.weight) {
        loaded.push({ ...item, amount: item.weight, fractional: false });
        remaining -= item.weight;
        totalProfit += item.profit;
        
        steps.push({
          title: `Step ${stepNum}: Load ${item.name}`,
          desc: `Rajnikanth picks ${item.name} (${item.weight} tons)`,
          loaded: [...loaded],
          remaining: remaining,
          totalProfit: totalProfit
        });
        stepNum++;
      }
    }

    return steps;
  };

  const greedySteps = cargo.length > 0 ? calculateGreedySolution() : [];
  const randomSteps = cargo.length > 0 ? calculateRandomSolution() : [];
  const currentSteps = approach === 'greedy' ? greedySteps : randomSteps;
  const currentStep = currentSteps[step] || { loaded: [], remaining: capacity, totalProfit: 0 };

  const nextStep = () => {
    if (step < currentSteps.length - 1) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 0) setStep(step - 1);
  };

  const reset = () => {
    setStep(0);
  };

  const switchApproach = (newApproach: string) => {
  setApproach(newApproach);
  setStep(0);
};


  const cargoWithRatio = cargo.map(item => ({
    ...item,
    ratio: item.profit / item.weight
  }));

  // Input Screen
  if (!showSimulation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Ship className="w-10 h-10 text-blue-600" />
              <h1 className="text-4xl font-bold text-gray-800">Cargo Loading Setup</h1>
            </div>
            <p className="text-lg text-gray-600">Configure your ship and cargo details</p>
          </div>

          {/* Ship Capacity Input */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Ship Capacity</h2>
            <div className="flex items-center gap-4">
              <input
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(parseFloat(e.target.value) || 0)}
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-lg"
                placeholder="Enter ship capacity"
              />
              <span className="text-gray-600 font-semibold">tons</span>
            </div>
          </div>

          {/* Add Cargo Form */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add Cargo Items
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <input
                type="text"
                value={newCargo.name}
                onChange={(e) => setNewCargo({...newCargo, name: e.target.value})}
                className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                placeholder="Cargo name"
              />
              <input
                type="number"
                value={newCargo.weight}
                onChange={(e) => setNewCargo({...newCargo, weight: e.target.value})}
                className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                placeholder="Weight (tons)"
              />
              <input
                type="number"
                value={newCargo.profit}
                onChange={(e) => setNewCargo({...newCargo, profit: e.target.value})}
                className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                placeholder="Profit (₹ Lakhs)"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={addCargo}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Cargo
              </button>
              <button
                onClick={loadSampleData}
                className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all"
              >
                Load Sample Data
              </button>
            </div>
          </div>

          {/* Cargo List */}
          {cargo.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Cargo Inventory ({cargo.length} items)
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left p-3 text-gray-700">Cargo Type</th>
                      <th className="text-right p-3 text-gray-700">Weight (tons)</th>
                      <th className="text-right p-3 text-gray-700">Profit (₹ Lakhs)</th>
                      <th className="text-right p-3 text-gray-700">Ratio (₹/ton)</th>
                      <th className="text-center p-3 text-gray-700">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cargoWithRatio.map((item, idx) => (
                      <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded ${item.color}`}></div>
                            {item.name}
                          </div>
                        </td>
                        <td className="text-right p-3">{item.weight}</td>
                        <td className="text-right p-3">₹{item.profit}</td>
                        <td className="text-right p-3 font-semibold text-green-600">
                          {item.ratio.toFixed(2)}
                        </td>
                        <td className="text-center p-3">
                          <button
                            onClick={() => removeCargo(idx)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Start Button */}
          {cargo.length > 0 && (
            <button
              onClick={startSimulation}
              className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
            >
              Start Simulation →
            </button>
          )}

          {cargo.length === 0 && (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 text-center">
              <AlertCircle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <p className="text-gray-700">Add cargo items or load sample data to begin</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Simulation Screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Ship className="w-10 h-10 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-800">Cargo Loading Demo</h1>
          </div>
          <p className="text-lg text-gray-600">Capacity: {capacity} tons</p>
          <button
            onClick={backToInput}
            className="mt-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all"
          >
            ← Back to Setup
          </button>
        </div>

        {/* Approach Selector */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Choose Strategy:</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => switchApproach('greedy')}
              className={`p-6 rounded-lg border-2 transition-all ${
                approach === 'greedy'
                  ? 'border-green-500 bg-green-50 shadow-md'
                  : 'border-gray-200 hover:border-green-300'
              }`}
            >
              <div className="text-2xl mb-2">💼</div>
              <h3 className="font-bold text-lg text-gray-800">Mr. Dayal</h3>
              <p className="text-sm text-gray-600">Greedy Algorithm</p>
              <p className="text-xs text-gray-500 mt-2">Sorts by profit/weight ratio</p>
            </button>
            
            <button
              onClick={() => switchApproach('random')}
              className={`p-6 rounded-lg border-2 transition-all ${
                approach === 'random'
                  ? 'border-orange-500 bg-orange-50 shadow-md'
                  : 'border-gray-200 hover:border-orange-300'
              }`}
            >
              <div className="text-2xl mb-2">🎲</div>
              <h3 className="font-bold text-lg text-gray-800">Mr. Rajnikanth</h3>
              <p className="text-sm text-gray-600">Random Selection</p>
              <p className="text-xs text-gray-500 mt-2">No planning, just loading</p>
            </button>
          </div>
        </div>

        {/* Simulation Area */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">{currentStep.title}</h2>
            <div className="text-right">
              <div className="text-sm text-gray-600">Step {step + 1} of {currentSteps.length}</div>
            </div>
          </div>

          <p className="text-gray-600 mb-6 text-lg">{currentStep.desc}</p>

          {/* Ship Visualization */}
          <div className="bg-gradient-to-r from-blue-100 to-blue-50 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Ship className="w-6 h-6 text-blue-600" />
                <span className="font-semibold text-gray-800">Ship Cargo</span>
              </div>
              <div className="text-sm text-gray-600">
                {(capacity - currentStep.remaining).toFixed(1)}/{capacity} tons loaded
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-8 mb-4 overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                style={{ width: `${((capacity - currentStep.remaining) / capacity) * 100}%` }}
              >
                <span className="text-white text-xs font-semibold">
                  {(capacity - currentStep.remaining).toFixed(1)} tons
                </span>
              </div>
            </div>

            {/* Loaded Items */}
            <div className="space-y-2">
              {currentStep.loaded.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No cargo loaded yet</p>
              ) : (
                currentStep.loaded.map((item, idx) => (
                  <div
                    key={idx}
                    className={`${item.color} bg-opacity-20 border-l-4 ${item.color.replace('bg-', 'border-')} p-3 rounded`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-800">
                        {item.name}
                        {item.fractional && (
                          <span className="ml-2 text-sm text-gray-600">
                            (Fraction: {item.fraction})
                          </span>
                        )}
                      </span>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">{item.amount.toFixed(1)} tons</div>
                        <div className="text-sm font-semibold text-green-600">
                          +₹{(item.profit * (item.amount / item.weight)).toFixed(1)}L
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="text-sm text-gray-600 mb-1">Total Profit</div>
              <div className="text-2xl font-bold text-green-600">
                ₹{currentStep.totalProfit.toFixed(1)}L
              </div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="text-sm text-gray-600 mb-1">Capacity Used</div>
              <div className="text-2xl font-bold text-blue-600">
                {(capacity - currentStep.remaining).toFixed(1)} tons
              </div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <div className="text-sm text-gray-600 mb-1">Remaining</div>
              <div className="text-2xl font-bold text-purple-600">
                {currentStep.remaining.toFixed(1)} tons
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={prevStep}
              disabled={step === 0}
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              ← Previous
            </button>
            <button
              onClick={reset}
              className="px-6 py-3 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 transition-all"
            >
              Reset
            </button>
            <button
              onClick={nextStep}
              disabled={step === currentSteps.length - 1}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Next →
            </button>
          </div>
        </div>

        {/* Final Comparison */}
        {step === currentSteps.length - 1 && (
          <>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl shadow-lg p-6 border-2 border-green-200 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-6 h-6 text-green-600" />
                <h3 className="text-xl font-bold text-gray-800">Final Results</h3>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">🎲 Rajnikanth (Random)</h4>
                  <p className="text-3xl font-bold text-orange-600">
                    ₹{randomSteps[randomSteps.length - 1]?.totalProfit.toFixed(1)}L
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">💼 Dayal (Greedy)</h4>
                  <p className="text-3xl font-bold text-green-600">
                    ₹{greedySteps[greedySteps.length - 1]?.totalProfit.toFixed(1)}L
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-green-200">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 font-semibold">Profit Improvement:</span>
                  <span className="text-2xl font-bold text-green-600">
                    +₹{(greedySteps[greedySteps.length - 1]?.totalProfit - randomSteps[randomSteps.length - 1]?.totalProfit).toFixed(1)}L
                    ({(((greedySteps[greedySteps.length - 1]?.totalProfit - randomSteps[randomSteps.length - 1]?.totalProfit) / randomSteps[randomSteps.length - 1]?.totalProfit) * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
            </div>

            {/* Profit Comparison Charts */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className="flex items-center gap-2 mb-6">
                <BarChart3 className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-bold text-gray-800">Profit Analysis</h3>
              </div>

              {/* Bar Chart Comparison */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-700 mb-4">Profit Comparison</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    {
                      name: 'Rajnikanth (Random)',
                      Profit: randomSteps[randomSteps.length - 1]?.totalProfit.toFixed(1)
                    },
                    {
                      name: 'Dayal (Greedy)',
                      Profit: greedySteps[greedySteps.length - 1]?.totalProfit.toFixed(1)
                    }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis label={{ value: 'Profit (₹ Lakhs)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip formatter={(value) => `₹${value}L`} />
                    <Bar dataKey="Profit" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Step-by-Step Progress Line Chart */}
              <div>
                <h4 className="text-lg font-semibold text-gray-700 mb-4">Profit Growth Over Steps</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={
                    greedySteps.map((step, idx) => ({
                      step: idx,
                      'Greedy (Dayal)': step.totalProfit.toFixed(1),
                      'Random (Rajnikanth)': randomSteps[idx]?.totalProfit.toFixed(1) || randomSteps[randomSteps.length - 1]?.totalProfit.toFixed(1)
                    }))
                  }>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="step" label={{ value: 'Step Number', position: 'insideBottom', offset: -5 }} />
                    <YAxis label={{ value: 'Profit (₹ Lakhs)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip formatter={(value) => `₹${value}L`} />
                    <Legend />
                    <Line type="monotone" dataKey="Greedy (Dayal)" stroke="#10b981" strokeWidth={3} dot={{ r: 5 }} />
                    <Line type="monotone" dataKey="Random (Rajnikanth)" stroke="#f97316" strokeWidth={3} dot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {/* Algorithm Info */}
        <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-800">
              {approach === 'greedy' ? 'Greedy Algorithm' : 'Random Selection'}
            </h3>
          </div>
          {approach === 'greedy' ? (
            <div className="text-gray-700 space-y-2">
              <p>• <strong>Time Complexity:</strong> O(n log n) - dominated by sorting</p>
              <p>• <strong>Strategy:</strong> Sort by profit-to-weight ratio, pick highest first</p>
              <p>• <strong>Key Advantage:</strong> Guarantees optimal solution for fractional problems</p>
            </div>
          ) : (
            <div className="text-gray-700 space-y-2">
              <p>• <strong>Strategy:</strong> Load items without calculation or planning</p>
              <p>• <strong>Result:</strong> Suboptimal profit due to poor item selection</p>
              <p>• <strong>Loss:</strong> Missing potential profit compared to greedy approach</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FractionalKnapsackDemo;
