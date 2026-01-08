
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { User, UserStatsSummary, LogEntry } from './types';
import { generateUserReports } from './logic';
import AggressiveHeader from './components/AggressiveHeader';
import Motivation from './components/Motivation';
import Leaderboard from './components/Leaderboard';
import ComparisonChart from './components/ComparisonChart';
import StatCard from './components/StatCard';
import ExecutionHistory from './components/ExecutionHistory';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const INITIAL_DATE = '2026-01-08';

const INITIAL_USERS: User[] = [
  {
    id: 'user-ijan',
    name: 'Ijan',
    joinDate: '2026-01-01',
    logs: [
      { id: 'i-1', date: '2026-01-01', distance: 1.1 },
      { id: 'i-2', date: '2026-01-02', distance: 1.2 },
      { id: 'i-3', date: '2026-01-03', distance: 1.3 },
      { id: 'i-4', date: '2026-01-04', distance: 1.4 },
      { id: 'i-5', date: '2026-01-05', distance: 1.5 },
      { id: 'i-6', date: '2026-01-06', distance: 1.6 },
      { id: 'i-7', date: '2026-01-07', distance: 1.7 },
      { id: 'i-8', date: '2026-01-08', distance: 1.8 }
    ]
  },
  {
    id: 'user-will',
    name: 'Will',
    joinDate: '2026-01-01',
    logs: [{ id: 'w-1', date: '2026-01-08', distance: 15.0 }]
  },
  {
    id: 'user-duchess',
    name: 'Duchess',
    joinDate: '2026-01-01',
    logs: [{ id: 'd-1', date: '2026-01-08', distance: 8.0 }]
  }
];

const MONTHLY_TARGETS = [
  { name: 'Jan', value: 80.6 },
  { name: 'Feb', value: 96.6 },
  { name: 'Mar', value: 142.6 },
  { name: 'Apr', value: 166.5 },
  { name: 'May', value: 204.6 },
  { name: 'Jun', value: 226.5 },
  { name: 'Jul', value: 266.6 },
  { name: 'Aug', value: 297.6 },
  { name: 'Sep', value: 316.5 },
  { name: 'Oct', value: 359.6 },
  { name: 'Nov', value: 376.5 },
  { name: 'Dec', value: 421.6 }
];

const App: React.FC = () => {
  const [simDate, setSimDate] = useState(INITIAL_DATE);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [selectedUserId, setSelectedUserId] = useState<string>('all');
  
  // Add Run Form State
  const [addRunUser, setAddRunUser] = useState<string>(INITIAL_USERS[0].id);
  const [addRunDist, setAddRunDist] = useState<string>('');
  const [addRunDate, setAddRunDate] = useState<string>(simDate);
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  
  // New User State
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserJoinDate, setNewUserJoinDate] = useState(simDate);

  const logDateInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editingLogId) setAddRunDate(simDate);
  }, [simDate, editingLogId]);

  const userSummaries = useMemo<UserStatsSummary[]>(() => {
    return users.map(u => {
      const reports = generateUserReports(u, simDate);
      const latestIdx = reports.findIndex(r => r.date === simDate);
      const latest = latestIdx !== -1 ? reports[latestIdx] : reports[reports.length - 1];
      
      return {
        id: u.id,
        name: u.name,
        totalRun: latest.cumulativeRun,
        currentDebt: latest.cumulativeDebt,
        status: latest.cumulativeDebt > 0.05 ? 'DEBT' : 'CLEAR',
        reports
      };
    });
  }, [users, simDate]);

  const teamTotalDebt = userSummaries.reduce((acc, u) => acc + u.currentDebt, 0);
  const highestDebtor = useMemo(() => {
    return [...userSummaries].sort((a, b) => b.currentDebt - a.currentDebt)[0];
  }, [userSummaries]);

  const handleTriggerPicker = (ref: React.RefObject<HTMLInputElement>) => {
    if (ref.current) ref.current.showPicker();
  };

  const handleAddOrUpdateRun = (e: React.FormEvent) => {
    e.preventDefault();
    const d = parseFloat(addRunDist.replace(',', '.'));
    if (isNaN(d) || d < 0) return;

    setUsers(prev => prev.map(u => {
      if (u.id === addRunUser) {
        if (editingLogId) {
          return { ...u, logs: u.logs.map(log => log.id === editingLogId ? { ...log, distance: d, date: addRunDate } : log) };
        } else {
          return { ...u, logs: [...u.logs, { id: `${Date.now()}`, date: addRunDate, distance: d }] };
        }
      }
      return u;
    }));
    setAddRunDist('');
    setEditingLogId(null);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim()) return;

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: newUserName.trim(),
      joinDate: newUserJoinDate,
      logs: []
    };

    setUsers(prev => [...prev, newUser]);
    setNewUserName('');
    setShowAddUserModal(false);
    // Automatically select the new user so they can log their first run
    setSelectedUserId(newUser.id);
    setAddRunUser(newUser.id);
  };

  const selectedSummary = useMemo(() => userSummaries.find(u => u.id === selectedUserId), [userSummaries, selectedUserId]);
  const selectedUser = useMemo(() => users.find(u => u.id === selectedUserId), [users, selectedUserId]);

  const currentMonthName = new Date(simDate).toLocaleString('default', { month: 'long' });

  return (
    <div className="min-h-screen bg-white">
      <AggressiveHeader simDate={simDate} onSimDateChange={setSimDate} />

      <main className="max-w-7xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        
        {/* SIDEBAR / TOP ON MOBILE */}
        <div className="lg:col-span-4 space-y-6 md:space-y-8">
          <Motivation highestDebtor={highestDebtor} totalDebt={teamTotalDebt} />

          {/* LOG RUN FORM */}
          <div className={`p-6 md:p-8 bg-white rounded-3xl border border-gray-100 shadow-sm transition-all ${editingLogId ? 'ring-2 ring-red-500' : ''}`}>
            <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-6 flex items-center justify-between">
              {editingLogId ? 'Update Log' : 'Log Daily Miles'}
              <span className={`text-[9px] px-2 py-1 rounded-full font-bold uppercase ${editingLogId ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                {editingLogId ? 'Editing' : 'New Deployment'}
              </span>
            </h2>
            <form onSubmit={handleAddOrUpdateRun} className="space-y-4 md:space-y-5">
              <div>
                <label className="block text-gray-400 font-bold uppercase text-[9px] tracking-widest mb-2">Operative</label>
                <select 
                  value={addRunUser}
                  onChange={e => setAddRunUser(e.target.value)}
                  disabled={!!editingLogId}
                  className="w-full bg-gray-50 border border-gray-100 p-4 text-sm font-bold text-gray-900 rounded-2xl appearance-none focus:bg-white focus:border-red-500 transition-all"
                >
                  {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div onClick={() => handleTriggerPicker(logDateInputRef)} className="bg-gray-50 border border-gray-100 p-4 rounded-2xl cursor-pointer hover:bg-white transition-all">
                  <label className="block text-gray-400 font-bold uppercase text-[9px] mb-1">Date</label>
                  <input ref={logDateInputRef} type="date" value={addRunDate} onChange={e => setAddRunDate(e.target.value)} className="w-full bg-transparent text-sm font-bold text-gray-900 outline-none" required />
                </div>
                <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl focus-within:bg-white transition-all">
                  <label className="block text-gray-400 font-bold uppercase text-[9px] mb-1">Distance (KM)</label>
                  <input type="number" step="0.01" value={addRunDist} onChange={e => setAddRunDist(e.target.value)} placeholder="0.0" className="w-full bg-transparent text-xl font-bold text-gray-900 outline-none" required />
                </div>
              </div>
              <button type="submit" className="w-full bg-gray-900 text-white font-bold py-4 rounded-2xl uppercase tracking-widest text-sm hover:bg-black shadow-lg active:scale-[0.98] transition-all">
                {editingLogId ? 'Save Changes' : 'Confirm Mission'}
              </button>
            </form>
          </div>

          {/* MONTHLY TARGETS BAR CHART */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-6">Yearly Protocol Scaling</h3>
            <div className="h-40 md:h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={MONTHLY_TARGETS}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={9} fontWeight={800} />
                  <Tooltip 
                    cursor={{ fill: '#f9fafb' }}
                    contentStyle={{ border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '10px' }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {MONTHLY_TARGETS.map((entry, index) => (
                      <Cell key={index} fill={entry.name === currentMonthName.slice(0,3) ? '#dc2626' : '#e5e7eb'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="lg:col-span-8 space-y-6 md:space-y-8">
          <Leaderboard 
            users={userSummaries} 
            simDate={simDate} 
            onAddUserClick={() => {
              setNewUserJoinDate(simDate);
              setShowAddUserModal(true);
            }} 
          />

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-1.5 bg-gray-50/50 flex gap-1 overflow-x-auto no-scrollbar border-b border-gray-100">
              <button 
                onClick={() => setSelectedUserId('all')} 
                className={`flex-none px-5 py-3 text-[10px] md:text-[11px] font-bold uppercase rounded-xl transition-all whitespace-nowrap ${selectedUserId === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Squad Overview
              </button>
              {users.map(u => (
                <button 
                  key={u.id} 
                  onClick={() => setSelectedUserId(u.id)} 
                  className={`flex-none px-5 py-3 text-[10px] md:text-[11px] font-bold uppercase rounded-xl transition-all whitespace-nowrap ${selectedUserId === u.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  {u.name}
                </button>
              ))}
            </div>
            
            <div className="p-6 md:p-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
               <StatCard label="VOLUME TO DATE" value={(selectedSummary ? selectedSummary.totalRun : userSummaries.reduce((acc,s)=>acc+s.totalRun,0)).toFixed(1)} subLabel="KM" />
               <StatCard label="CURRENT DEBT" value={(selectedSummary ? selectedSummary.currentDebt : teamTotalDebt).toFixed(1)} subLabel="KM" isAlert={(selectedSummary ? selectedSummary.currentDebt : teamTotalDebt) > 0.05} />
               <StatCard label="STATUS" value={selectedSummary ? (selectedSummary.currentDebt > 0.05 ? "IN DEBT" : "CLEAR") : "ACTIVE"} isAlert={selectedSummary ? selectedSummary.currentDebt > 0.05 : teamTotalDebt > 0.05} />
            </div>

            <div className="p-1 md:p-2 border-t border-gray-50">
              <ComparisonChart 
                summaries={selectedUserId === 'all' ? userSummaries : (selectedSummary ? [selectedSummary] : [])} 
                isTeamView={selectedUserId === 'all'}
                simDate={simDate}
              />
            </div>

            {selectedUser && (
              <div className="p-6 md:p-8 bg-gray-50/30 border-t border-gray-100">
                <ExecutionHistory 
                  logs={selectedUser.logs} 
                  userName={selectedUser.name} 
                  onEdit={(log) => { setAddRunUser(selectedUser.id); setAddRunDist(log.distance.toString()); setAddRunDate(log.date); setEditingLogId(log.id); window.scrollTo({top:0, behavior:'smooth'}); }} 
                  onDelete={(id) => setUsers(prev => prev.map(u => u.id === selectedUser.id ? {...u, logs: u.logs.filter(l=>l.id!==id)} : u))} 
                />
              </div>
            )}
          </div>
        </div>
      </main>
      
      {/* ADD USER MODAL */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddUserModal(false)}></div>
          <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="bg-gray-900 p-8 text-white relative">
               <div className="absolute top-0 right-0 p-8 opacity-10">
                 <svg width="120" height="120" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>
               </div>
               <h2 className="text-2xl font-black uppercase tracking-tight mb-1 relative z-10">Recruit Operative</h2>
               <p className="text-gray-400 font-bold uppercase text-[9px] tracking-[0.2em] relative z-10">Assigning New Duty Station</p>
            </div>
            <form onSubmit={handleCreateUser} className="p-8 space-y-6">
              <div>
                <label className="block text-gray-400 font-bold uppercase text-[10px] tracking-widest mb-2">Operative Name</label>
                <input 
                  autoFocus
                  type="text" 
                  value={newUserName}
                  onChange={e => setNewUserName(e.target.value)}
                  placeholder="E.G. GOGGINS"
                  className="w-full bg-gray-50 border border-gray-100 p-4 text-base font-black text-gray-900 rounded-2xl outline-none focus:bg-white focus:border-red-600 transition-all uppercase"
                />
              </div>
              <div>
                <label className="block text-gray-400 font-bold uppercase text-[10px] tracking-widest mb-2">Deployment Start (Join Date)</label>
                <input 
                  type="date" 
                  value={newUserJoinDate}
                  onChange={e => setNewUserJoinDate(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 p-4 text-sm font-bold text-gray-900 rounded-2xl outline-none focus:bg-white focus:border-red-600 transition-all"
                />
                <p className="mt-2 text-[9px] text-gray-400 italic font-medium leading-relaxed">
                  * Cumulative targets and debt will only be calculated from this date forward.
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowAddUserModal(false)}
                  className="flex-1 bg-gray-100 text-gray-400 font-bold py-4 rounded-2xl uppercase tracking-widest text-xs hover:bg-gray-200 transition-all"
                >
                  Abort
                </button>
                <button 
                  type="submit" 
                  className="flex-[2] bg-red-600 text-white font-black py-4 rounded-2xl uppercase tracking-widest text-xs hover:bg-red-700 shadow-lg shadow-red-200 transition-all"
                >
                  Activate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <footer className="p-8 md:p-12 text-center text-gray-300 uppercase font-black text-[8px] md:text-[10px] tracking-[0.4em]">
        Stay hard. The road doesn't care.
      </footer>
    </div>
  );
};

export default App;
