import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  Box, Flex, Grid, Text, Badge, Link, Spinner,
  VStack, HStack, Icon, Tooltip,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import {
  BsBoxArrowUpRight, BsChevronLeft, BsChevronRight,
  BsSortDown, BsClock, BsArrowRight,
} from "react-icons/bs";
import { IoMdRocket } from "react-icons/io";
import { RiAliensFill } from "react-icons/ri";
import { FaReact, FaGlobe } from "react-icons/fa";
import { AiOutlineMail, AiOutlineLinkedin, AiOutlineGithub } from "react-icons/ai";
import { BiCube } from "react-icons/bi";

const GREEN     = "#42c920";
const GREEN_DIM = "rgba(66,201,32,0.15)";
const PROXY     = "/.netlify/functions/news?url=";

// ── CSS global Matrix ──────────────────────────────────────────────────────
const MATRIX_CSS = `
@keyframes nwsEntry    { from{opacity:0;transform:translateY(-14px)} to{opacity:1;transform:translateY(0)} }
@keyframes nwsCardIn   { from{opacity:0;transform:translateY(28px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
@keyframes nwsHeroTxt  { from{opacity:0;transform:translateX(-22px)} to{opacity:1;transform:translateX(0)} }
@keyframes nwsHeroImg  { from{opacity:0;transform:scale(1.07)} to{opacity:1;transform:scale(1)} }
@keyframes nwsScanline { 0%{top:-4%;opacity:.85} 100%{top:110%;opacity:0} }
@keyframes nwsBarGrow  { from{width:0} to{width:32px} }
@keyframes nwsMatrixFall { 0%{opacity:1;transform:translateY(-10px)} 100%{opacity:0;transform:translateY(100px)} }
@keyframes nwsGlitch {
  0%,87%,100%{transform:translate(0);filter:none}
  88%{transform:translate(-3px,0);filter:drop-shadow(3px 0 #00ffff) brightness(1.3)}
  90%{transform:translate(3px,0);filter:drop-shadow(-3px 0 #ff00cc) brightness(1.2)}
  92%{transform:translate(-1px,0);filter:none}
  94%{transform:translate(2px,0);filter:drop-shadow(2px 0 ${GREEN}) brightness(1.1)}
  96%{transform:translate(0);filter:none}
}
@keyframes nwsPulse {
  0%,100%{box-shadow:0 0 8px ${GREEN}33}
  50%{box-shadow:0 0 22px ${GREEN}88, 0 0 44px ${GREEN}33}
}
@keyframes nwsCornerAppear { from{opacity:0;transform:scale(0.4)} to{opacity:1;transform:scale(1)} }
@keyframes nwsBorderFlicker {
  0%,100%{border-color:${GREEN}88}
  50%{border-color:${GREEN}}
  75%{border-color:${GREEN}55}
}

/* card hover effects via classes */
.nws-card { position:relative; overflow:hidden; }
.nws-card .nws-scanline {
  position:absolute; left:0; right:0; height:2px; z-index:6;
  background:linear-gradient(to right, transparent, ${GREEN}, transparent);
  top:-4%; opacity:0; pointer-events:none;
}
.nws-card:hover .nws-scanline { animation: nwsScanline 0.55s ease forwards; }
.nws-card:hover .nws-img { filter:brightness(1.12) saturate(1.15); transform:scale(1.04); transition:all .4s ease; }
.nws-card .nws-img { transition:all .4s ease; width:100%; height:100%; object-fit:cover; display:block; }

.nws-corner { position:absolute; width:0; height:0; opacity:0; z-index:7; pointer-events:none;
  border-color:${GREEN}; border-style:solid; transition:all .22s ease; }
.nws-card:hover .nws-corner { width:14px; height:14px; opacity:1; animation: nwsCornerAppear .22s ease; }
.nws-corner.tl { top:5px; left:5px;  border-width:2px 0 0 2px; }
.nws-corner.tr { top:5px; right:5px; border-width:2px 2px 0 0; }
.nws-corner.bl { bottom:5px; left:5px;  border-width:0 0 2px 2px; }
.nws-corner.br { bottom:5px; right:5px; border-width:0 2px 2px 0; }

.nws-card:hover .nws-title { color:${GREEN}; animation: nwsGlitch 2s ease infinite; transition:color .2s; }
.nws-card:hover { animation: nwsBorderFlicker 1.5s ease infinite; }

.nws-hero-badge { animation: nwsHeroTxt .5s ease .05s both; }
.nws-hero-title { animation: nwsHeroTxt .55s ease .18s both; }
.nws-hero-desc  { animation: nwsHeroTxt .5s ease .32s both; }
.nws-hero-btn   { animation: nwsHeroTxt .5s ease .46s both; }
.nws-hero-img   { animation: nwsHeroImg .8s ease .1s both; }
.nws-header     { animation: nwsEntry .45s ease both; }
`;

// ── useInView hook ─────────────────────────────────────────────────────────
function useInView(threshold = 0.12) {
  const ref    = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setInView(true); obs.disconnect(); }
    }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

// ── Matrix rain loader ─────────────────────────────────────────────────────
const MCHARS = "アイウエオカキクケコサシスセソ0123456789ABCDEF</>{}[]ΩΨΞ".split("");
function MatrixLoader() {
  const drops = useMemo(() =>
    Array.from({ length: 60 }, (_, i) => ({
      char:  MCHARS[(i * 7) % MCHARS.length],
      left:  `${(i / 60) * 100}%`,
      delay: (i * 83) % 1400,
      dur:   0.6 + (i % 5) * 0.18,
      top:   `${(i * 37) % 100}%`,
      op:    0.08 + (i % 4) * 0.07,
    })), []);

  return (
    <Flex h="70vh" align="center" justify="center" position="relative" overflow="hidden">
      {drops.map((d, i) => (
        <Text key={i} position="absolute" left={d.left} top={d.top}
          fontSize="xs" color={GREEN} fontFamily="monospace" userSelect="none"
          style={{ opacity: d.op, animation: `nwsMatrixFall ${d.dur}s ${d.delay}ms infinite` }}>
          {d.char}
        </Text>
      ))}
      <VStack spacing={4} zIndex={1}>
        <Spinner size="xl" color={GREEN} thickness="3px"
          style={{ animation: "nwsPulse 1.5s ease infinite" }} />
        <Text fontSize="sm" color={GREEN} fontFamily="monospace" letterSpacing="0.2em">
          CARREGANDO FEEDS...
        </Text>
        <Text fontSize="xs" color="whiteAlpha.300" fontFamily="monospace">
          {MCHARS.slice(0, 12).join(" ")}
        </Text>
      </VStack>
    </Flex>
  );
}

// ── Categorias ─────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id:"brasil",     title:"🇧🇷 Brasil",             desc:"Cobertura nacional sobre IA — startups, pesquisas e impacto no mercado brasileiro.", sources:["SWEN.AI","AINEWS","Exame IA"],                                                                       accent:"#00c8ff" },
  { id:"pesquisa",   title:"🔬 Pesquisa & Ciência",   desc:"Descobertas, papers e avanços de MIT, Google Research, IEEE, BAIR e The Gradient.", sources:["MIT News","MIT Tech Rev","Google Res.","BAIR","The Gradient","IEEE Spectrum"],                         accent:"#a855f7" },
  { id:"industria",  title:"💼 Indústria & Tech",      desc:"Lançamentos e tendências do setor — TechCrunch, The Verge, Wired e AI News.",         sources:["The Verge","TechCrunch","Wired AI","AI News","AI Insider","AI Weekly"],                               accent:GREEN     },
  { id:"ferramentas",title:"🛠️ Modelos & Ferramentas", desc:"Novos modelos, datasets e ferramentas para desenvolvedores de IA.",                   sources:["HuggingFace","KDnuggets","MIRI","Synced"],                                                           accent:"#ff9d00" },
];

// ── Score importância ──────────────────────────────────────────────────────
const SOURCE_PRESTIGE = { "MIT Tech Rev":20,"MIT News":20,"Google Res.":18,"IEEE Spectrum":16,"BAIR":15,"The Gradient":14,"Wired AI":13,"The Verge":13,"TechCrunch":12,"HuggingFace":11,"AI News":10,"AI Insider":10,"AI Weekly":9,"Exame IA":9,"KDnuggets":8,"SWEN.AI":8,"AINEWS":8,"Synced":7 };
const KW_CRITICAL = ["agi","artificial general intelligence","superintelligence","breakthrough","ban","regulation","acquisition","merger","openai","anthropic","google deepmind","deepmind"];
const KW_HIGH     = ["gpt","claude","gemini","llama","mistral","nvidia","sora","release","launch","lança","novo modelo","new model","meta ai","microsoft","apple intelligence"];
const KW_MED      = ["model","machine learning","neural","research","billion","open source","safety","hallucination","robot","robô","chatbot","agent","agente","multimodal"];

function scoreArticle(a) {
  let s = SOURCE_PRESTIGE[a.source?.name] || 5;
  if (a.date && !isNaN(a.date)) {
    const h = (Date.now() - a.date) / 3_600_000;
    s += h<2?40:h<6?33:h<12?25:h<24?16:h<48?8:h<96?3:0;
  }
  const t = (a.title||"").toLowerCase();
  KW_CRITICAL.forEach(k=>{ if(t.includes(k)) s+=18; });
  KW_HIGH.forEach(k    =>{ if(t.includes(k)) s+=10; });
  KW_MED.forEach(k     =>{ if(t.includes(k)) s+=4;  });
  if(a.img) s+=6;
  return s;
}

function importanceLevel(score) {
  if (score >= 65) return { label:"URGENTE",   color:"#ff4444", icon:"🔥" };
  if (score >= 45) return { label:"DESTAQUE",  color:"#ffaa00", icon:"⚡" };
  if (score >= 28) return { label:"RELEVANTE", color:GREEN,     icon:"📌" };
  return null;
}

// ── Feeds ──────────────────────────────────────────────────────────────────
const FEEDS = [
  { name:"SWEN.AI",       url:"https://swen.ai/feed/",                                                 flag:"🇧🇷", color:"#00c8ff" },
  { name:"AINEWS",        url:"https://ainews.com.br/feed/",                                           flag:"🇧🇷", color:"#00c8ff" },
  { name:"Exame IA",      url:"https://exame.com/inteligencia-artificial/feed/",                       flag:"🇧🇷", color:"#00c8ff" },
  { name:"AI Weekly",     url:"https://aiweekly.co/issues.rss",                                        flag:"🌎", color:GREEN },
  { name:"AI Insider",    url:"https://theaiinsider.tech/feed",                                        flag:"🌎", color:GREEN },
  { name:"MIT News",      url:"https://news.mit.edu/rss/topic/artificial-intelligence",                flag:"🌎", color:GREEN },
  { name:"AI News",       url:"https://www.artificialintelligence-news.com/feed/",                     flag:"🌎", color:GREEN },
  { name:"The Verge",     url:"https://www.theverge.com/ai-artificial-intelligence/rss/index.xml",     flag:"🌎", color:GREEN },
  { name:"TechCrunch",    url:"https://techcrunch.com/category/artificial-intelligence/feed/",         flag:"🌎", color:GREEN },
  { name:"Wired AI",      url:"https://www.wired.com/feed/tag/artificial-intelligence/",               flag:"🌎", color:GREEN },
  { name:"MIT Tech Rev",  url:"https://www.technologyreview.com/feed/",                                flag:"🌎", color:GREEN },
  { name:"Google Res.",   url:"https://research.google/blog/rss/",                                     flag:"🌎", color:"#4285f4" },
  { name:"HuggingFace",   url:"https://huggingface.co/blog/feed.xml",                                  flag:"🌎", color:"#ff9d00" },
  { name:"The Gradient",  url:"https://thegradient.pub/rss/",                                          flag:"🌎", color:GREEN },
  { name:"IEEE Spectrum", url:"https://spectrum.ieee.org/feeds/topic/artificial-intelligence.rss",    flag:"🌎", color:"#00629b" },
  { name:"BAIR",          url:"https://bair.berkeley.edu/blog/feed.xml",                               flag:"🌎", color:"#ffa500" },
  { name:"KDnuggets",     url:"https://kdnuggets.com/feed",                                            flag:"🌎", color:GREEN },
];

// ── RSS parsing ────────────────────────────────────────────────────────────
function extractImage(item) {
  for (const tag of ["thumbnail","content","image"]) {
    for (const name of [`media:${tag}`,tag]) {
      const els = item.getElementsByTagName(name);
      for (let i=0;i<els.length;i++){const u=els[i].getAttribute("url");if(u&&/^https?:\/\//i.test(u))return u;}
    }
  }
  const enc=item.getElementsByTagName("enclosure");
  for(let i=0;i<enc.length;i++){const t=enc[i].getAttribute("type")||"",u=enc[i].getAttribute("url")||"";if(u&&(t.startsWith("image")||/\.(jpe?g|png|gif|webp)$/i.test(u)))return u;}
  for(const sel of["description","content","summary","content:encoded"]){
    const el=item.getElementsByTagName(sel)[0];if(!el)continue;
    const raw=el.textContent||"";
    const m=raw.match(/<img[^>]+src=["']([^"']+)["']/i);if(m&&/^https?:\/\//i.test(m[1]))return m[1];
    const mu=raw.match(/https?:\/\/[^\s"'<>]+\.(?:jpe?g|png|gif|webp)/i);if(mu)return mu[0];
  }
  return null;
}

function parseRSS(xml) {
  const doc=new DOMParser().parseFromString(xml,"text/xml");
  let items=Array.from(doc.querySelectorAll("item"));
  if(!items.length) items=Array.from(doc.querySelectorAll("entry"));
  return items.slice(0,8).map(item=>{
    const gt=tag=>item.getElementsByTagName(tag)[0]?.textContent?.trim()??"";
    const title=gt("title");
    let link=gt("link");
    if(!link){const el=item.querySelector("link[rel='alternate']")||item.querySelector("link");link=el?.getAttribute("href")||el?.textContent?.trim()||"";}
    const date=gt("pubDate")||gt("published")||gt("updated")||gt("dc:date");
    const img=extractImage(item);
    const rawDesc=gt("description")||gt("summary")||gt("content");
    const desc=rawDesc.replace(/<[^>]+>/g,"").trim().slice(0,180)||"";
    return{title,link,date:date?new Date(date):null,img:img||null,desc};
  }).filter(a=>a.title&&a.link);
}

function timeAgo(date) {
  if(!date||isNaN(date))return"";
  const d=(Date.now()-date)/1000;
  if(d<3600) return`${Math.floor(d/60)}min`;
  if(d<86400)return`${Math.floor(d/3600)}h`;
  if(d<604800)return`${Math.floor(d/86400)}d`;
  return date.toLocaleDateString("pt-BR");
}

// ── Tradução ───────────────────────────────────────────────────────────────
const translationCache=new Map();
async function translateTitle(text){
  if(translationCache.has(text))return translationCache.get(text);
  try{
    const url=`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=pt-BR&dt=t&q=`+encodeURIComponent(text);
    const res=await fetch(url,{signal:AbortSignal.timeout(3000)});
    const data=await res.json();
    const out=data[0]?.map(d=>d[0]).join("")||text;
    translationCache.set(text,out);return out;
  }catch{return text;}
}
async function translateArticles(articles){
  const result=articles.map(a=>({...a}));
  const idxs=result.map((a,i)=>a.source.flag==="🌎"?i:-1).filter(i=>i>=0).slice(0,40);
  for(let b=0;b<idxs.length;b+=5)
    await Promise.all(idxs.slice(b,b+5).map(async idx=>{result[idx]={...result[idx],title:await translateTitle(result[idx].title)};}));
  return result;
}

const cache={data:null,ts:0};
const CACHE_TTL=5*60*1000;

// ── Corners helper ─────────────────────────────────────────────────────────
const Corners = () => (
  <>
    <span className="nws-corner tl" />
    <span className="nws-corner tr" />
    <span className="nws-corner bl" />
    <span className="nws-corner br" />
  </>
);

// ── Hero Feature ───────────────────────────────────────────────────────────
function HeroFeature({ article }) {
  const [imgErr, setImgErr] = useState(false);
  if (!article) return null;
  const lvl = importanceLevel(article.score ?? 0);

  return (
    <Box bg="#0a0a0a" borderBottom="1px solid rgba(255,255,255,0.07)">
      <Grid templateColumns={{ base:"1fr", md:"1fr 1fr" }} minH={{ base:"auto", md:"420px" }}>
        {/* Left */}
        <Flex direction="column" justify="center"
          px={{ base:5, md:10 }} py={{ base:6, md:10 }}
          borderRight={{ md:"1px solid rgba(255,255,255,0.06)" }}>

          <div className="nws-hero-badge">
            <HStack mb={3} spacing={2} flexWrap="wrap">
              <Badge fontSize="9px" fontFamily="heading" fontWeight="700"
                bg={`${article.source.color}22`} color={article.source.color}
                border={`1px solid ${article.source.color}44`} px={2} py="2px" borderRadius="full">
                {article.source.flag} {article.source.name}
              </Badge>
              {lvl && (
                <Badge fontSize="9px" fontFamily="heading" fontWeight="800"
                  bg={`${lvl.color}18`} color={lvl.color}
                  border={`1px solid ${lvl.color}44`} px={2} py="2px" borderRadius="full">
                  {lvl.icon} {lvl.label}
                </Badge>
              )}
              {article.date && <Text fontSize="10px" color="whiteAlpha.400" fontFamily="heading">{timeAgo(article.date)} atrás</Text>}
            </HStack>
          </div>

          <div className="nws-hero-title">
            <Link href={article.link} isExternal _hover={{ textDecoration:"none" }}>
              <Text fontSize={{ base:"2xl", md:"3xl", lg:"4xl" }} fontWeight="900"
                color="white" fontFamily="heading" lineHeight="1.2"
                _hover={{ color:GREEN }} transition="color .2s" mb={4}>
                {article.title}
              </Text>
            </Link>
          </div>

          {article.desc && (
            <div className="nws-hero-desc">
              <Text fontSize="sm" color="whiteAlpha.600" fontFamily="heading" lineHeight="1.7" mb={5} noOfLines={3}>
                {article.desc}
              </Text>
            </div>
          )}

          <div className="nws-hero-btn">
            <Link href={article.link} isExternal _hover={{ textDecoration:"none" }} display="inline-flex" alignSelf="flex-start">
              <Box display="flex" alignItems="center" gap={2}
                px={4} py={2} borderRadius="full" bg={GREEN} color="#000"
                fontFamily="heading" fontSize="xs" fontWeight="700"
                _hover={{ bg:"white", transform:"translateY(-1px)" }} transition="all .2s"
                style={{ boxShadow:`0 0 20px ${GREEN}66` }}>
                Saiba mais <Icon as={BsArrowRight} boxSize="12px" />
              </Box>
            </Link>
          </div>
        </Flex>

        {/* Right — image */}
        <Box position="relative" minH={{ base:"220px", md:"auto" }} overflow="hidden" bg="#111">
          {article.img && !imgErr ? (
            <img src={article.img} alt="" className="nws-hero-img"
              style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover" }}
              onError={() => setImgErr(true)}
            />
          ) : (
            <Flex h="100%" minH="220px" align="center" justify="center" bg="#0d0d0d">
              <Text fontSize="6xl" style={{ animation:"nwsGlitch 3s ease infinite" }}>🤖</Text>
            </Flex>
          )}
          <Box position="absolute" inset={0} display={{ base:"none", md:"block" }}
            background="linear-gradient(to right, #0a0a0a 0%, transparent 28%)" />
          {/* Matrix scanlines on image */}
          <Box position="absolute" inset={0} pointerEvents="none"
            style={{ backgroundImage:"repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(66,201,32,0.018) 3px,rgba(66,201,32,0.018) 4px)" }} />
        </Box>
      </Grid>
    </Box>
  );
}

// ── Mini Card ──────────────────────────────────────────────────────────────
function MiniCard({ title, link, img, date, source, score, revealDelay=0 }) {
  const [imgErr, setImgErr] = useState(false);
  const [ref, inView]       = useInView(0.1);
  const lvl = importanceLevel(score ?? 0);

  return (
    <div ref={ref} style={{
      flexShrink: 0, width: "200px",
      opacity: inView ? 1 : 0,
      animation: inView ? `nwsCardIn .45s ease ${revealDelay}ms both` : "none",
    }}>
      <Link href={link} isExternal _hover={{ textDecoration:"none" }} display="block" h="100%">
        <Box className="nws-card"
          borderRadius="8px" bg="#0f0f0f"
          border="1px solid rgba(255,255,255,0.08)"
          _hover={{ borderColor:`${source.color}77`, transform:"translateY(-3px)" }}
          transition="border-color .2s, transform .2s, box-shadow .2s"
          style={{ "--hover-shadow":`0 0 20px ${source.color}33` }}
          h="100%"
        >
          <Corners />
          <Box h="110px" overflow="hidden" position="relative" bg="#111">
            <div className="nws-scanline" />
            {img && !imgErr
              ? <img src={img} alt="" className="nws-img" onError={()=>setImgErr(true)} />
              : <Flex h="100%" align="center" justify="center"><Text fontSize="2xl">📰</Text></Flex>
            }
            {lvl && <Box position="absolute" top={0} left={0} right={0} h="2px" bg={lvl.color} style={{boxShadow:`0 0 6px ${lvl.color}`}} />}
            <Box position="absolute" top={1} left={1}>
              <Badge fontSize="8px" fontFamily="heading" fontWeight="700"
                bg="rgba(0,0,0,0.85)" color={source.color}
                border={`1px solid ${source.color}33`} px={1} py="1px" borderRadius="full">
                {source.flag}
              </Badge>
            </Box>
          </Box>
          <Box p={2}>
            {date && <Text fontSize="9px" color="whiteAlpha.400" fontFamily="heading" mb={1}>{timeAgo(date)} atrás</Text>}
            <Text className="nws-title" fontSize="xs" fontWeight="700" color="whiteAlpha.900"
              fontFamily="heading" lineHeight="1.35"
              style={{ display:"-webkit-box", WebkitLineClamp:3, WebkitBoxOrient:"vertical", overflow:"hidden" }}>
              {title}
            </Text>
          </Box>
        </Box>
      </Link>
    </div>
  );
}

// ── Category Card ──────────────────────────────────────────────────────────
function CategoryCard({ title, link, img, date, source, score, desc, revealDelay=0 }) {
  const [imgErr, setImgErr] = useState(false);
  const [ref, inView]       = useInView(0.08);
  const lvl = importanceLevel(score ?? 0);

  return (
    <div ref={ref} style={{
      flexShrink: 0, width: "260px",
      opacity: inView ? 1 : 0,
      animation: inView ? `nwsCardIn .5s ease ${revealDelay}ms both` : "none",
    }}>
      <Link href={link} isExternal _hover={{ textDecoration:"none" }} display="block" h="100%">
        <Box className="nws-card"
          borderRadius="8px" bg="#0d0d0d"
          border="1px solid rgba(255,255,255,0.08)"
          _hover={{ borderColor:`${source.color}77`, transform:"translateY(-4px)" }}
          transition="border-color .2s, transform .25s, box-shadow .25s"
          h="100%" display="flex" flexDirection="column"
        >
          <Corners />
          {/* Image */}
          <Box h="140px" overflow="hidden" position="relative" bg="#111" flexShrink={0}>
            <div className="nws-scanline" />
            {img && !imgErr
              ? <img src={img} alt="" className="nws-img" onError={()=>setImgErr(true)} />
              : <Flex h="100%" align="center" justify="center"><Text fontSize="3xl">🤖</Text></Flex>
            }
            {lvl && <Box position="absolute" top={0} left={0} right={0} h="2px" bg={lvl.color} style={{boxShadow:`0 0 8px ${lvl.color}`}} />}
            <Box position="absolute" bottom={0} left={0} right={0} h="50px"
              background="linear-gradient(to top, #0d0d0d, transparent)" />
            <Box position="absolute" top={2} left={2}>
              <Badge fontSize="8px" fontFamily="heading" fontWeight="700"
                bg="rgba(0,0,0,0.85)" color={source.color}
                border={`1px solid ${source.color}33`} px={1.5} py="1px" borderRadius="full">
                {source.flag} {source.name}
              </Badge>
            </Box>
          </Box>

          {/* Content */}
          <Box p={3} flex={1}>
            {date && <Text fontSize="9px" color="whiteAlpha.400" fontFamily="heading" mb={1}>{timeAgo(date)} atrás</Text>}
            <Text className="nws-title" fontSize="sm" fontWeight="700" color="whiteAlpha.900"
              fontFamily="heading" lineHeight="1.4"
              style={{ display:"-webkit-box", WebkitLineClamp:3, WebkitBoxOrient:"vertical", overflow:"hidden" }}>
              {title}
            </Text>
            {desc && (
              <Text fontSize="10px" color="whiteAlpha.500" fontFamily="heading" lineHeight="1.5" mt={1}
                style={{ display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>
                {desc}
              </Text>
            )}
            {lvl && (
              <Text fontSize="9px" fontFamily="heading" color={lvl.color} mt={2}
                style={{ animation:"nwsPulse 2s ease infinite" }}>
                {lvl.icon} {lvl.label}
              </Text>
            )}
          </Box>
        </Box>
      </Link>
    </div>
  );
}

// ── Scroll Row ─────────────────────────────────────────────────────────────
function ScrollRow({ articles, CardComponent }) {
  const ref = useRef(null);
  const scroll = dir => ref.current?.scrollBy({ left:dir*300, behavior:"smooth" });
  if (!articles.length) return null;

  return (
    <Box position="relative">
      <Box position="absolute" left={0} top="50%" transform="translateY(-50%)" zIndex={2}
        display={{ base:"none", md:"block" }}>
        <Box as="button" onClick={()=>scroll(-1)}
          w="32px" h="32px" display="flex" alignItems="center" justifyContent="center"
          bg="rgba(0,0,0,0.85)" border={`1px solid ${GREEN_DIM}`} borderRadius="full"
          color={GREEN} _hover={{ bg:GREEN, color:"#000" }} transition="all .2s" ml={-4}>
          <Icon as={BsChevronLeft} boxSize="12px" />
        </Box>
      </Box>

      <div ref={ref} style={{
        display:"flex", flexDirection:"row", gap:"12px",
        overflowX:"auto", paddingBottom:"8px",
        scrollbarWidth:"thin",
        scrollbarColor:`${GREEN_DIM} transparent`,
      }}>
        {articles.map((a,i) => <CardComponent key={i} {...a} revealDelay={i*60} />)}
      </div>

      <Box position="absolute" right={0} top="50%" transform="translateY(-50%)" zIndex={2}
        display={{ base:"none", md:"block" }}>
        <Box as="button" onClick={()=>scroll(1)}
          w="32px" h="32px" display="flex" alignItems="center" justifyContent="center"
          bg="rgba(0,0,0,0.85)" border={`1px solid ${GREEN_DIM}`} borderRadius="full"
          color={GREEN} _hover={{ bg:GREEN, color:"#000" }} transition="all .2s" mr={-4}>
          <Icon as={BsChevronRight} boxSize="12px" />
        </Box>
      </Box>
    </Box>
  );
}

// ── Category Section ───────────────────────────────────────────────────────
function CategorySection({ title, desc, accent, articles }) {
  const [ref, inView] = useInView(0.1);
  if (!articles.length) return null;

  return (
    <Box py={8} borderTop="1px solid rgba(255,255,255,0.06)" ref={ref}>
      <Flex direction={{ base:"column", lg:"row" }} gap={{ base:4, lg:8 }} align="flex-start">
        {/* Left */}
        <Box flexShrink={0} w={{ base:"100%", lg:"220px" }}
          style={{ opacity:inView?1:0, animation:inView?"nwsHeroTxt .5s ease .05s both":"none" }}>
          <Box w="32px" h="3px" bg={accent} borderRadius="full" mb={3}
            style={{ boxShadow:`0 0 10px ${accent}`, animation:inView?"nwsBarGrow .4s ease both":"none" }} />
          <Text fontFamily="heading" fontSize="lg" fontWeight="800" color="white" lineHeight="1.2" mb={2}>
            {title}
          </Text>
          <Text fontSize="xs" color="whiteAlpha.500" fontFamily="heading" lineHeight="1.6">{desc}</Text>
          <Text fontSize="10px" fontFamily="heading" color={accent} mt={3} fontWeight="600">
            {articles.length} artigos
          </Text>
        </Box>

        {/* Right */}
        <Box flex={1} minW={0} overflow="hidden" px={{ base:0, md:4 }}>
          <ScrollRow articles={articles} CardComponent={CategoryCard} />
        </Box>
      </Flex>
    </Box>
  );
}

// ── Filter Button ──────────────────────────────────────────────────────────
function FilterBtn({ id, label, active, onClick }) {
  return (
    <Box as="button" onClick={()=>onClick(id)}
      px={3} py={1} borderRadius="4px" fontSize="xs" fontFamily="heading"
      fontWeight={active?"700":"500"} color={active?GREEN:"whiteAlpha.600"}
      bg={active?`${GREEN}15`:"transparent"} transition="all .15s"
      _hover={{ color:GREEN, bg:`${GREEN}10` }} whiteSpace="nowrap"
      style={active?{textShadow:`0 0 8px ${GREEN}88`}:{}}>
      {label}
    </Box>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
const NewsPage = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [filter, setFilter]     = useState("all");
  const [sortBy, setSortBy]     = useState("importance");
  const fetchedRef = useRef(false);

  const fetchFeeds = useCallback(async () => {
    if(cache.data && Date.now()-cache.ts<CACHE_TTL){setArticles(cache.data);return;}
    setLoading(true);
    const results = await Promise.allSettled(
      FEEDS.map(feed=>
        fetch(`${PROXY}${encodeURIComponent(feed.url)}`,{signal:AbortSignal.timeout(10000)})
          .then(r=>r.text())
          .then(xml=>parseRSS(xml).map(a=>({...a,source:feed})))
      )
    );
    const raw=results.filter(r=>r.status==="fulfilled").flatMap(r=>r.value)
      .sort((a,b)=>(b.date?.getTime()??0)-(a.date?.getTime()??0));
    const translated=await translateArticles(raw);
    const scored=translated.map(a=>({...a,score:scoreArticle(a)}));
    cache.data=scored;cache.ts=Date.now();
    setArticles(scored);setLoading(false);
  },[]);

  useEffect(()=>{if(!fetchedRef.current){fetchedRef.current=true;fetchFeeds();}}, [fetchFeeds]);

  const filtered = articles.filter(a=>{
    if(filter==="br")    return a.source.flag==="🇧🇷";
    if(filter==="world") return a.source.flag==="🌎";
    return true;
  });
  const sorted=[...filtered].sort((a,b)=>
    sortBy==="importance"
      ?(b.score??0)-(a.score??0)
      :(b.date?.getTime()??0)-(a.date?.getTime()??0)
  );

  const heroArticle   = sorted.find(a=>a.img)||sorted[0];
  const heroLink      = heroArticle?.link;
  const miniCards     = sorted.filter(a=>a.link!==heroLink).slice(0,10);
  const usedLinks     = new Set([heroLink,...miniCards.map(a=>a.link)]);
  const catArticles   = sorted.filter(a=>!usedLinks.has(a.link));
  const catSources    = CATEGORIES.flatMap(c=>c.sources);

  return (
    <Box minH="100vh" w="100vw" bg="#050505" color="white" overflowX="hidden">
      {/* Inject Matrix CSS once */}
      <style>{MATRIX_CSS}</style>

      {/* ── Header ── */}
      <Box className="nws-header"
        bg="rgba(5,5,5,0.98)" position="sticky" top={0} zIndex={200}
        backdropFilter="blur(14px)"
        style={{boxShadow:`0 4px 30px rgba(66,201,32,0.2)`,borderBottom:`2px solid ${GREEN}`}}>

        {/* Linha 1 */}
        <Flex align="center" justify="space-between" gap={2}
          px={{base:3,md:8}} py={3} borderBottom="1px solid rgba(255,255,255,0.07)">
          <HStack spacing={3}>
            <Text fontSize="2xl" lineHeight={1} style={{animation:"nwsGlitch 5s ease infinite"}}>🛸</Text>
            <Box>
              <HStack spacing={0} align="baseline">
                <Text fontFamily="heading" fontSize={{base:"md",md:"xl"}} fontWeight="900"
                  color={GREEN} lineHeight={1} letterSpacing="0.1em"
                  style={{textShadow:`0 0 18px ${GREEN}99`}}>IA NEWS</Text>
                <Text fontFamily="heading" fontSize={{base:"md",md:"xl"}} fontWeight="900"
                  color="whiteAlpha.700" lineHeight={1} letterSpacing="0.1em" ml={2}>BRUNO KOBI</Text>
              </HStack>
              <Text fontSize="8px" color="whiteAlpha.350" fontFamily="heading" letterSpacing="0.22em">
                INTELIGÊNCIA ARTIFICIAL
              </Text>
            </Box>
          </HStack>

          <Tooltip label={sortBy==="importance"?"Ordenado por importância":"Ordenado por data"} hasArrow>
            <Box as="button"
              onClick={()=>setSortBy(s=>s==="importance"?"date":"importance")}
              px={3} py={1} borderRadius="full" fontSize="xs" fontFamily="heading"
              display="flex" alignItems="center" gap={1}
              color={sortBy==="importance"?"#ffaa00":"whiteAlpha.500"}
              bg={sortBy==="importance"?"rgba(255,170,0,0.1)":"transparent"}
              border={`1px solid ${sortBy==="importance"?"#ffaa0055":"rgba(255,255,255,0.12)"}`}
              transition="all .2s" _hover={{borderColor:"#ffaa00",color:"#ffaa00"}}>
              <Icon as={sortBy==="importance"?BsSortDown:BsClock} boxSize="11px" />
              <Text as="span" ml={1}>{sortBy==="importance"?"Importância":"Data"}</Text>
            </Box>
          </Tooltip>
        </Flex>

        {/* Linha 2 — nav */}
        <Box px={{base:2,md:4}} overflowX="auto"
          css={{"&::-webkit-scrollbar":{display:"none"},scrollbarWidth:"none"}}>
          <HStack spacing={0} py="8px" minW="max-content" justify="space-between" w="100%">
            <HStack spacing={0}>
              {[
                {label:"Home",        to:"/",                                        icon:IoMdRocket,        external:false},
                {label:"Sobre",       to:"/about",                                   icon:RiAliensFill,      external:false},
                {label:"Projetos",    to:"/projects",                                icon:FaReact,           external:false},
                {label:"Contato",     to:"/#contato",                                icon:AiOutlineMail,     external:false},
                {label:"Portfolio 3D",to:"https://brunokobi3d.netlify.app",          icon:BiCube,            external:true},
                {label:"Mapa Esri",   to:"/map",                                     icon:FaGlobe,           external:false},
                {label:"Linkedin",    to:"https://www.linkedin.com/in/brunokobi/",  icon:AiOutlineLinkedin, external:true},
                {label:"Github",      to:"https://github.com/brunokobi",            icon:AiOutlineGithub,   external:true},
              ].map((item,i)=>{
                const inner=(
                  <HStack spacing={1} px={3} py={2} cursor="pointer"
                    color="whiteAlpha.600" borderRadius="4px"
                    _hover={{color:GREEN,bg:`${GREEN}0d`}} transition="all .15s">
                    <Icon as={item.icon} boxSize="14px" />
                    <Text fontFamily="heading" fontSize="xs" fontWeight="500"
                      display={{base:"none",md:"block"}} whiteSpace="nowrap">{item.label}</Text>
                  </HStack>
                );
                return item.external
                  ? <Link key={i} href={item.to} isExternal _hover={{textDecoration:"none"}}>{inner}</Link>
                  : <Link key={i} as={RouterLink} to={item.to} _hover={{textDecoration:"none"}}>{inner}</Link>;
              })}
            </HStack>

            <HStack spacing={0} flexShrink={0}>
              <Box w="1px" h="14px" bg="rgba(255,255,255,0.1)" mx={2} />
              <FilterBtn id="all"   label="Todos" active={filter==="all"}   onClick={setFilter} />
              <FilterBtn id="world" label="🌎"    active={filter==="world"} onClick={setFilter} />
              <FilterBtn id="br"    label="🇧🇷"   active={filter==="br"}    onClick={setFilter} />
            </HStack>
          </HStack>
        </Box>
      </Box>

      {loading ? <MatrixLoader /> : (
        <Box pb="60px">
          {heroArticle && <HeroFeature article={heroArticle} />}

          {miniCards.length>0 && (
            <Box px={{base:4,md:8}} py={6} bg="#080808" borderBottom="1px solid rgba(255,255,255,0.06)">
              <Text fontFamily="heading" fontSize="xs" fontWeight="700" color="whiteAlpha.400"
                letterSpacing="0.15em" mb={4}>MAIS NOTÍCIAS</Text>
              <ScrollRow articles={miniCards} CardComponent={MiniCard} />
            </Box>
          )}

          <Box px={{base:4,md:8}}>
            {CATEGORIES.map(cat=>(
              <CategorySection key={cat.id} {...cat}
                articles={catArticles.filter(a=>cat.sources.includes(a.source.name))} />
            ))}
            {(()=>{
              const remaining=catArticles.filter(a=>!catSources.includes(a.source.name));
              if(!remaining.length)return null;
              return <CategorySection title="🌐 Outros" desc="Outras fontes de IA ao redor do mundo."
                accent="rgba(255,255,255,0.35)" articles={remaining} />;
            })()}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default NewsPage;
