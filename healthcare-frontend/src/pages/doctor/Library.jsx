import DoctorLayout from '@/components/layout/doctor/DoctorLayout';
import { SearchOutlined, LoadingOutlined, LinkOutlined } from '@ant-design/icons';
import { Button, Card, Input, Tag, List, Modal, Avatar, Spin, Alert } from 'antd';
import { useState, useEffect, useCallback } from 'react';

// PubMed NCBI E-utilities API - free, no key needed, updated daily
const PUBMED_SEARCH_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi';
const PUBMED_FETCH_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi';
const PUBMED_SUMMARY_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi';

const categories = [
  { label: 'Tất cả', query: 'clinical guidelines treatment' },
  { label: 'Tim mạch', query: 'hypertension cardiology guidelines 2024' },
  { label: 'Nội khoa', query: 'internal medicine clinical guidelines' },
  { label: 'Thần kinh', query: 'neurology stroke treatment guidelines' },
  { label: 'Nhi khoa', query: 'pediatrics clinical guidelines treatment' },
  { label: 'Ung bướu', query: 'oncology cancer treatment guidelines 2024' },
  { label: 'Sản phụ khoa', query: 'obstetrics gynecology clinical guidelines' },
  { label: 'Ngoại khoa', query: 'surgery clinical guidelines protocol' },
];

const Library = () => {
  const [activeCategory, setActiveCategory] = useState(categories[0]);
  const [search, setSearch] = useState('');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailText, setDetailText] = useState('');
  const [error, setError] = useState(null);

  const fetchArticles = useCallback(async (query) => {
    setLoading(true);
    setError(null);
    try {
      const searchQuery = search.trim() ? `${search} clinical guidelines` : query;
      
      // Step 1: Search PubMed for article IDs
      const searchRes = await fetch(
        `${PUBMED_SEARCH_URL}?db=pubmed&term=${encodeURIComponent(searchQuery)}&retmax=12&sort=relevance&retmode=json&datetype=pdat&mindate=2020&maxdate=2025`
      );
      const searchData = await searchRes.json();
      const ids = searchData.esearchresult?.idlist || [];

      if (ids.length === 0) {
        setArticles([]);
        return;
      }

      // Step 2: Get summaries for those IDs
      const summaryRes = await fetch(
        `${PUBMED_SUMMARY_URL}?db=pubmed&id=${ids.join(',')}&retmode=json`
      );
      const summaryData = await summaryRes.json();
      const result = summaryData.result;

      const articleList = ids
        .map(id => result[id])
        .filter(Boolean)
        .map(item => {
          const authors = item.authors?.slice(0, 2).map(a => a.name).join(', ') || 'N/A';
          return {
            id: item.uid,
            title: item.title?.replace(/\.$/, ''),
            journal: item.fulljournalname || item.source,
            pubDate: item.pubdate,
            authors,
            doi: item.elocationid,
            source: item.source,
          };
        });

      setArticles(articleList);
    } catch (err) {
      setError('Không thể kết nối PubMed. Hãy kiểm tra kết nối internet.');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchArticles(activeCategory.query);
  }, [activeCategory]);

  const handleSearch = () => fetchArticles(activeCategory.query);

  const openDetail = async (article) => {
    setSelectedArticle(article);
    setDetailLoading(true);
    setDetailText('');
    try {
      const res = await fetch(
        `${PUBMED_FETCH_URL}?db=pubmed&id=${article.id}&rettype=abstract&retmode=text`
      );
      const text = await res.text();
      setDetailText(text);
    } catch {
      setDetailText('Không thể tải nội dung chi tiết. Vui lòng truy cập PubMed để đọc toàn văn.');
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <DoctorLayout>
      <div className="p-6 max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 m-0">📚 Thư viện Y khoa</h1>
          <p className="text-gray-500 mt-1 m-0">
            Dữ liệu thực từ <strong>PubMed / NCBI</strong> — hơn 35 triệu bài nghiên cứu, cập nhật hàng ngày
          </p>
        </div>

        <Card className="mb-5 rounded-xl shadow-sm border-0">
          <div className="flex gap-2">
            <Input
              prefix={<SearchOutlined className="text-gray-400" />}
              placeholder="Tìm theo tên bệnh, phác đồ, thuốc (tiếng Anh)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onPressEnter={handleSearch}
              size="large"
              className="rounded-lg flex-1"
              allowClear
            />
            <Button size="large" type="primary" className="bg-blue-600 border-none" onClick={handleSearch}>
              Tìm kiếm
            </Button>
          </div>
          <div className="flex gap-2 flex-wrap mt-4">
            {categories.map((c) => (
              <Button
                key={c.label}
                size="small"
                onClick={() => { setActiveCategory(c); setSearch(''); }}
                type={activeCategory.label === c.label ? 'primary' : 'default'}
                className={activeCategory.label === c.label ? 'bg-blue-600 border-none' : ''}
              >
                {c.label}
              </Button>
            ))}
          </div>
        </Card>

        {error && (
          <Alert type="warning" message={error} className="mb-4 rounded-xl" showIcon />
        )}

        <Card className="rounded-xl shadow-sm border-0">
          {loading ? (
            <div className="flex flex-col items-center py-16 gap-4">
              <Spin indicator={<LoadingOutlined style={{ fontSize: 40, color: '#3b82f6' }} spin />} />
              <span className="text-gray-500">Đang tải dữ liệu từ PubMed...</span>
            </div>
          ) : (
            <List
              dataSource={articles}
              locale={{ emptyText: 'Không tìm thấy kết quả. Thử từ khóa tiếng Anh.' }}
              renderItem={(item) => (
                <List.Item
                  className="hover:bg-gray-50 px-4 rounded-lg cursor-pointer transition-colors"
                  onClick={() => openDetail(item)}
                  actions={[
                    <Button type="link" size="small" onClick={(e) => { e.stopPropagation(); openDetail(item); }}>
                      Xem
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar className="bg-blue-50 text-blue-600 text-lg shrink-0">📄</Avatar>}
                    title={
                      <span className="font-semibold text-gray-800 text-sm leading-snug line-clamp-2">
                        {item.title}
                      </span>
                    }
                    description={
                      <div className="flex gap-2 mt-1 flex-wrap items-center">
                        <Tag color="blue">{item.source}</Tag>
                        <span className="text-gray-400 text-xs">{item.pubDate}</span>
                        <span className="text-gray-400 text-xs">• {item.authors}</span>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </Card>
      </div>

      {/* Detail Modal */}
      <Modal
        open={!!selectedArticle}
        onCancel={() => { setSelectedArticle(null); setDetailText(''); }}
        footer={
          selectedArticle && (
            <div className="flex justify-between items-center">
              <a
                href={`https://pubmed.ncbi.nlm.nih.gov/${selectedArticle.id}`}
                target="_blank"
                rel="noreferrer"
                className="text-blue-500 flex items-center gap-1 text-sm hover:underline"
              >
                <LinkOutlined /> Đọc toàn văn trên PubMed
              </a>
              <Button onClick={() => { setSelectedArticle(null); setDetailText(''); }}>Đóng</Button>
            </div>
          )
        }
        width={780}
        title={
          selectedArticle && (
            <div className="pr-8">
              <p className="font-bold text-gray-800 text-base leading-snug m-0">{selectedArticle.title}</p>
              <div className="flex gap-2 mt-2 flex-wrap">
                <Tag color="blue">{selectedArticle.journal}</Tag>
                <span className="text-gray-400 text-xs self-center">{selectedArticle.pubDate}</span>
                <span className="text-gray-400 text-xs self-center">• {selectedArticle.authors}</span>
              </div>
            </div>
          )
        }
        styles={{ body: { maxHeight: '62vh', overflowY: 'auto', backgroundColor: '#f9fafb', borderRadius: 8, padding: 20 } }}
      >
        {detailLoading ? (
          <div className="flex flex-col items-center py-10 gap-3">
            <Spin indicator={<LoadingOutlined style={{ fontSize: 32, color: '#3b82f6' }} spin />} />
            <span className="text-gray-500">Đang tải Abstract từ PubMed...</span>
          </div>
        ) : (
          <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">
            {detailText || 'Không có nội dung.'}
          </pre>
        )}
      </Modal>
    </DoctorLayout>
  );
};

export default Library;
