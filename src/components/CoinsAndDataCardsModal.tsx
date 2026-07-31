import React, { useState, useEffect } from 'react';
import { 
  Coins, 
  CreditCard, 
  Sparkles, 
  Check, 
  Zap, 
  ShieldCheck, 
  X, 
  ArrowRight, 
  PlusCircle, 
  Gift, 
  TrendingUp,
  Flame,
  Award
} from 'lucide-react';
import { CoinPackage, DataCard, UserProfile } from '../types';

interface CoinsAndDataCardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onUpdateUser: (updatedUser: UserProfile) => void;
  onOpenNexusAi: () => void;
}

export const CoinsAndDataCardsModal: React.FC<CoinsAndDataCardsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
  onOpenNexusAi,
}) => {
  const [activeTab, setActiveTab] = useState<'datacards' | 'buycoins'>('datacards');
  const [coinsBalance, setCoinsBalance] = useState<number>(currentUser?.coinsBalance ?? 250);
  const [userCards, setUserCards] = useState<any[]>([]);
  const [datacardCatalog, setDatacardCatalog] = useState<DataCard[]>([]);
  const [coinPackages, setCoinPackages] = useState<CoinPackage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [purchasingCardId, setPurchasingCardId] = useState<string | null>(null);
  const [buyingPackId, setBuyingPackId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const email = currentUser?.email || 'kushanthag@gmail.com';

  useEffect(() => {
    if (isOpen) {
      fetchCatalogAndBalance();
    }
  }, [isOpen, email]);

  const fetchCatalogAndBalance = async () => {
    setLoading(true);
    try {
      const [resCoins, resCatalog] = await Promise.all([
        fetch(`/api/v1/coins/balance?email=${encodeURIComponent(email)}`),
        fetch(`/api/v1/datacards/catalog?email=${encodeURIComponent(email)}`)
      ]);

      const dataCoins = await resCoins.json();
      const dataCatalog = await resCatalog.json();

      if (dataCoins.status === 'success') {
        setCoinsBalance(dataCoins.coinsBalance);
        if (dataCoins.packages) setCoinPackages(dataCoins.packages);
        if (currentUser) {
          onUpdateUser({ ...currentUser, coinsBalance: dataCoins.coinsBalance });
        }
      }

      if (dataCatalog.status === 'success') {
        if (dataCatalog.catalog) setDatacardCatalog(dataCatalog.catalog);
        if (dataCatalog.userPurchasedCards) setUserCards(dataCatalog.userPurchasedCards);
      }
    } catch (err) {
      console.error('Error loading coins/cards data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyCoinPackage = async (pkg: CoinPackage) => {
    setBuyingPackId(pkg.id);
    setNotification(null);
    try {
      const res = await fetch('/api/v1/coins/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, packageId: pkg.id })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setCoinsBalance(data.newCoinsBalance);
        setNotification({
          type: 'success',
          message: `🎉 Added ${data.addedCoins} Nexus Coins to your account!`
        });
        if (currentUser) {
          onUpdateUser({ ...currentUser, coinsBalance: data.newCoinsBalance });
        }
      } else {
        setNotification({ type: 'error', message: data.message || 'Failed to buy coins.' });
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'Network error processing coin purchase.' });
    } finally {
      setBuyingPackId(null);
    }
  };

  const handlePurchaseDataCard = async (card: DataCard) => {
    setPurchasingCardId(card.id);
    setNotification(null);

    if (coinsBalance < card.coinPrice) {
      setNotification({
        type: 'error',
        message: `Insufficient Coins! Need ${card.coinPrice} Coins, but you have ${coinsBalance} Coins. Please buy coins first or ask Nexus AI!`
      });
      setActiveTab('buycoins');
      setPurchasingCardId(null);
      return;
    }

    try {
      const res = await fetch('/api/v1/datacards/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, cardId: card.id })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setCoinsBalance(data.remainingCoins);
        setUserCards(prev => [...prev, data.purchasedCard]);
        setNotification({
          type: 'success',
          message: `🚀 Activated "${card.title}" (${card.dataAllowance}) on your account!`
        });
        if (currentUser) {
          const updatedCards = [...(currentUser.activeDataCards || []), card.title];
          onUpdateUser({
            ...currentUser,
            coinsBalance: data.remainingCoins,
            activeDataCards: updatedCards
          });
        }
      } else {
        setNotification({ type: 'error', message: data.message || 'Failed to purchase data card.' });
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'Network error purchasing Data Card.' });
    } finally {
      setPurchasingCardId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header Banner */}
        <div className="relative bg-gradient-to-r from-amber-600/20 via-indigo-600/20 to-purple-600/20 p-6 border-b border-slate-800">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pr-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-tr from-amber-500 to-amber-400 rounded-xl shadow-lg text-slate-950 font-bold">
                <Coins className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
                  Nexus Coins & Data Card Vault
                  <span className="text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-medium">
                    INSTANT REDEEM
                  </span>
                </h2>
                <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
                  Use Nexus Coins to buy high-speed API Data Packs or ask Nexus AI to auto-allocate quota!
                </p>
              </div>
            </div>

            {/* User Coin Balance Badge */}
            <div className="flex items-center gap-3 bg-slate-950/80 border border-amber-500/40 rounded-xl px-4 py-2 shadow-inner">
              <Coins className="w-5 h-5 text-amber-400 animate-pulse" />
              <div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Your Balance</div>
                <div className="text-lg font-black text-amber-400 flex items-center gap-1">
                  {coinsBalance} <span className="text-xs text-amber-300 font-normal">Coins</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-6 border-b border-slate-800/80">
            <button
              onClick={() => setActiveTab('datacards')}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition ${
                activeTab === 'datacards'
                  ? 'border-amber-400 text-amber-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              API Data Cards ({datacardCatalog.length})
            </button>
            <button
              onClick={() => setActiveTab('buycoins')}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition ${
                activeTab === 'buycoins'
                  ? 'border-amber-400 text-amber-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-amber-400" />
              Buy / Top-Up Coins
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenNexusAi();
              }}
              className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 rounded-lg transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Ask Nexus AI to Gift/Buy
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {notification && (
            <div className={`p-4 rounded-xl text-xs sm:text-sm font-medium border flex items-center gap-3 ${
              notification.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}>
              <ShieldCheck className="w-5 h-5 flex-shrink-0" />
              <span>{notification.message}</span>
            </div>
          )}

          {/* Active Data Cards Section */}
          {userCards.length > 0 && activeTab === 'datacards' && (
            <div className="bg-slate-950/60 border border-emerald-500/20 rounded-xl p-4">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2 mb-3">
                <Award className="w-4 h-4" /> Active Subscriptions & Data Packs ({userCards.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {userCards.map((uc, i) => (
                  <div key={i} className="bg-slate-900 border border-slate-800 rounded-lg p-3 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-200">{uc.title}</div>
                      <div className="text-[11px] text-slate-400">{uc.allowance || 'High-Speed API Quota'}</div>
                    </div>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-semibold">
                      ACTIVE
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 1: API Data Cards */}
          {activeTab === 'datacards' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    Redeem API Data Cards with Nexus Coins
                  </h3>
                  <p className="text-xs text-slate-400">
                    Each card unlocks high-speed bandwidth, priority processing, and higher rate limits on all endpoints.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {datacardCatalog.map((card) => (
                  <div 
                    key={card.id}
                    className="relative bg-slate-950 border border-slate-800 hover:border-amber-500/50 rounded-xl p-5 flex flex-col justify-between transition group hover:shadow-xl"
                  >
                    {card.badge && (
                      <span className="absolute -top-2.5 right-4 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-md">
                        {card.badge}
                      </span>
                    )}

                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="text-sm font-bold text-slate-100 group-hover:text-amber-400 transition">
                          {card.title}
                        </h4>
                        <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-lg">
                          <Coins className="w-3.5 h-3.5 text-amber-400" />
                          <span className="text-xs font-black text-amber-400">{card.coinPrice}</span>
                        </div>
                      </div>

                      <div className="text-xs text-slate-400 mb-3">{card.description}</div>

                      <div className="space-y-1.5 border-t border-slate-800/80 pt-3 mb-4">
                        {card.features.map((feat, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                            <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => handlePurchaseDataCard(card)}
                      disabled={purchasingCardId === card.id}
                      className={`w-full py-2.5 px-4 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg ${
                        coinsBalance >= card.coinPrice
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      {purchasingCardId === card.id ? (
                        <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Zap className="w-3.5 h-3.5" />
                          {coinsBalance >= card.coinPrice ? `Redeem for ${card.coinPrice} Coins` : `Need ${card.coinPrice - coinsBalance} More Coins`}
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: Buy Coins */}
          {activeTab === 'buycoins' && (
            <div>
              <div className="mb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  Top-Up Nexus Coins Vault
                </h3>
                <p className="text-xs text-slate-400">
                  Select a coin package to add instant coins to your verified Google developer profile.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {coinPackages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className={`relative bg-slate-950 border rounded-xl p-4 flex flex-col justify-between transition ${
                      pkg.popular
                        ? 'border-amber-500/60 shadow-amber-500/10 shadow-lg'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {pkg.badge && (
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {pkg.badge}
                      </span>
                    )}

                    <div className="text-center pt-2">
                      <div className="inline-flex p-3 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 mb-2">
                        <Coins className="w-6 h-6" />
                      </div>
                      <h4 className="text-xs font-bold text-slate-200">{pkg.name}</h4>
                      <div className="text-xl font-black text-amber-400 mt-1">
                        {pkg.coins} <span className="text-xs font-normal text-slate-400">Coins</span>
                      </div>
                      {pkg.bonusCoins > 0 && (
                        <div className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 inline-block px-2 py-0.5 rounded-full mt-1">
                          +{pkg.bonusCoins} Bonus Coins!
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800 text-center">
                      <div className="text-base font-extrabold text-white mb-2">${pkg.priceUsd}</div>
                      <button
                        onClick={() => handleBuyCoinPackage(pkg)}
                        disabled={buyingPackId === pkg.id}
                        className="w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
                      >
                        {buyingPackId === pkg.id ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <PlusCircle className="w-3.5 h-3.5" />
                            Add Coins Now
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Instant Bonus Card */}
              <div className="mt-6 bg-gradient-to-r from-indigo-900/40 via-purple-900/40 to-slate-900 border border-indigo-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-500/20 text-indigo-300 rounded-lg">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Need Free Bonus Coins or API Error Support?</h4>
                    <p className="text-[11px] text-slate-400">
                      Nexus AI can grant bonus coins, perform self-repair on API error streams, or unban your Google account!
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onClose();
                    onOpenNexusAi();
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg whitespace-nowrap transition flex items-center gap-1.5"
                >
                  Open Nexus AI Control
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
