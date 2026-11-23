import json, os, sys, numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer
ROOT="."
src=open("research/analysis/run_comparisons.py").read()
exec(src[src.index("GROUPS = ["):src.index("def paired_stats")])
LAB={"google/gemma-4-31b":"Google","google/gemma-3-27b":"Google","openai/gpt-oss-120b":"OpenAI","openai/gpt-oss-20b":"OpenAI","meta/llama-4-scout":"Meta","nvidia/nemotron-3-33b":"NVIDIA","qwen/qwen3.8-27b":"Alibaba","qwen/qwen3.5-122b":"Alibaba","zhipu/glm-4.7-flash":"Zhipu","zhipu/glm-4-9b":"Zhipu"}
CN={"Alibaba","Zhipu"}
pages=[p for p in json.load(open("research/results/study/pages.json")) if p["set"]=="spark"]+json.load(open("research/results/new-labs/pages.json"))
home=[p for p in pages if p["is_home"] and p["model"] in LAB]
K=[k for k,_,_ in MEASURES]; label={k:l for k,l,_ in MEASURES}
X=np.array([[value(p,k) for k in K] for p in home],float); X[:,np.all(np.isnan(X),0)]=0
y=np.array([LAB[p["model"]] in CN for p in home]).astype(int); models=np.array([p["model"] for p in home])
Z=StandardScaler().fit_transform(SimpleImputer().fit_transform(X))
coef=LogisticRegression(C=0.5,max_iter=5000).fit(Z,y).coef_[0]
rows=[]
for i,k in enumerate(K):
    mm={m:np.nanmean(X[models==m,i]) for m in LAB}
    cn=[mm[m] for m in LAB if LAB[m] in CN]; us=[mm[m] for m in LAB if LAB[m] not in CN]
    # how many of 24 China-vs-US model pairs point the same way as the pooled difference
    d=np.nanmean(cn)-np.nanmean(us); agree=sum((c-u)*d>0 for c in cn for u in us)
    sd=np.nanstd(X[:,i]) or 1
    rows.append((k,label[k],coef[i],d/sd,agree,np.nanmean(cn),np.nanmean(us),min(cn),max(cn),min(us),max(us)))
print("by consistency across model pairs, then effect size")
for r in sorted(rows,key=lambda r:(-r[4],-abs(r[3])))[:10]:
    print(f"{r[1][:38]:38} coef {r[2]:+.2f} d {r[3]:+.2f} pairs {r[4]}/24  CN {r[5]:.2f} [{r[7]:.2f}-{r[8]:.2f}]  US {r[6]:.2f} [{r[9]:.2f}-{r[10]:.2f}]")
print("\nlargest classifier weights")
for r in sorted(rows,key=lambda r:-abs(r[2]))[:8]: print(f"{r[1][:38]:38} coef {r[2]:+.2f} pairs {r[4]}/24")
import itertools
print("\nexact model-level test (210 ways to pick 4 'Chinese' models of 10), one-sided in observed direction")
ms=list(LAB); res=[]
for i,k in enumerate(K):
    mm=np.array([np.nanmean(X[models==m,i]) for m in ms]); t=np.array([LAB[m] in CN for m in ms])
    if np.isnan(mm).any(): continue
    obs=mm[t].mean()-mm[~t].mean(); s=np.sign(obs) or 1
    null=[s*(mm[list(c)].mean()-np.delete(mm,list(c)).mean()) for c in itertools.combinations(range(10),4)]
    p=np.mean(np.array(null)>=s*obs-1e-12); res.append((p,label[k],obs))
res.sort()
ps=np.array([r[0] for r in res]); n=len(ps); q=np.minimum.accumulate((ps*n/np.arange(1,n+1))[::-1])[::-1]
for (p,l,o),qq in list(zip(res,q))[:8]: print(f"{l[:38]:38} p={p:.3f} q={qq:.3f}")
