import { useState, useEffect } from 'react'

// Writing suggestions based on chart types and rulebook guidelines - Vietnamese version
const HINTS = {
  line: {
    introduction: [
      "Paraphrase đề bài: 'The line graph compares/shows/gives information about...'",
      "Bao gồm: Cái gì? (dữ liệu), Ở đâu? (quốc gia/vị trí), Khi nào? (thời gian)",
      "Dùng thì đúng: thì quá khứ cho dữ liệu lịch sử, tương lai cho dự báo"
    ],
    overview: [
      "TÓM TẮT: Đây là phần quan trọng nhất! (Mục 3.1)",
      "Mô tả xu hướng tổng thể: tăng, giảm, dao động, ổn định",
      "Nêu số liệu cao nhất và thấp nhất mà không cần quá nhiều con số cụ thể",
      "Dùng: 'Overall, the data indicate a steady increase in... while... experienced a decline'"
    ],
    bodyParagraphs: [
      "Chuẩn: 2 đoạn thân bài, mỗi đoạn 3-4 câu (Mục 4.1)",
      "Nhóm theo thời gian (quá khứ vs tương lai) HOẶC theo xu hướng (tăng vs giảm)",
      "Bao gồm các điểm dữ liệu cụ thể để hỗ trợ quan sát của bạn",
      "Dùng cấu trúc so sánh: 'A was higher than B', 'The figure for A was... compared to B'"
    ],
    vocabulary: [
      "Tăng: rise, increase, grow, go up, climb, skyrocket, surge, soar",
      "Giảm: decrease, drop, decline, go down, fall, plummet",
      "Ổn định: remain stable, remain unchanged, level off, reach a plateau",
      "Dao động: fluctuate, vary from... to..."
    ],
    grammar: [
      "Chủ ngữ - Động từ đồng nhất: 'The number of students increases' (KHÔNG phải 'increase')",
      "Giới từ đúng: 'from 2000 to 2020', 'between 2000 and 2020'",
      "Dùng thì quá khứ (V2) cho dữ liệu lịch sử: increased, stood at, declined",
      "Sau giới từ, dùng V-ing: 'before increasing', 'after reaching a peak'"
    ]
  },
  bar: {
    introduction: [
      "Paraphrase: 'The bar chart gives information about the spending/expenditure of...'",
      "Bao gồm: Cái gì? (các danh mục), Ở đâu? (vị trí), Khi nào? (các giai đoạn thời gian)",
      "Nêu số lượng danh mục và giai đoạn thời gian"
    ],
    overview: [
      "TÓM TẮT: Nêu bật xu hướng chính và các tính năng quan trọng (Mục 3.1)",
      "Xác định giá trị/danh mục cao nhất và thấp nhất",
      "Nêu danh mục dominan hoặc thay đổi lớn nhất",
      "Tránh liệt kê tất cả các con số cụ thể"
    ],
    bodyParagraphs: [
      "Nhóm dữ liệu một cách hợp lý: giá trị cao cùng nhau, giá trị thấp cùng nhau",
      "So sánh các danh mục bằng: 'A accounted for X%, which was double that of B'",
      "Dùng: 'The largest proportion was...', 'The smallest category was...'",
      "Bao gồm 3-4 câu mỗi đoạn với dữ liệu hỗ trợ"
    ],
    vocabulary: [
      "Động từ: surpass, overtake, outpace, exceed, dominate, stand at",
      "Cụm từ: 'account for', 'occupy', 'make up', 'take up', 'consist of'",
      "Cao nhất: 'the largest', 'the highest', 'the most significant'",
      "Thấp nhất: 'the least', 'the lowest', 'the least significant'"
    ],
    grammar: [
      "Cách dùng mạo từ đúng: 'the largest', 'a significant increase'",
      "Dạng danh từ đúng: 'the number of users' (KHÔNG phải 'user')",
      "Chủ ngữ - Động từ đồng nhất: 'The figures show' (KHÔNG phải 'shows')",
      "Giới từ: 'account for + percentage', 'stand at + number'"
    ]
  },
  pie: {
    introduction: [
      "Paraphrase: 'The pie charts show... categories of spending in... different years'",
      "Bao gồm: Cái gì? (các danh mục), Số năm, Số phân đoạn",
      "Dùng thì hiện tại đơn cho dữ liệu thời gian vô hạn/thống kê"
    ],
    overview: [
      "TÓM TẮT: Xác định danh mục dominan và nhỏ nhất (Mục 3.1)",
      "Nêu: 'A accounted for the highest percentage, while B had the lowest'",
      "So sánh tỷ lệ: 'A made up twice as much as B'",
      "Giữ ngắn gọn - lưu chi tiết cho các đoạn thân"
    ],
    bodyParagraphs: [
      "Nhóm theo tỷ lệ tương tự hoặc các danh mục đối lập",
      "Dùng: 'The figure for A stood at X%, compared to Y% for B'",
      "Nêu: 'A accounted for X%, which was double that of B'",
      "Bao gồm các tỷ lệ cụ thể và so sánh"
    ],
    vocabulary: [
      "Tỷ lệ: 'account for', 'make up', 'occupy', 'take up', 'constitute'",
      "Cao nhất: 'the largest proportion', 'the majority of'",
      "Thấp nhất: 'the smallest proportion', 'a minority of'",
      "So sánh: 'twice as much as', 'three times as large as', 'half of'"
    ],
    grammar: [
      "Giới từ đúng: 'account for + percentage', 'make up + percentage'",
      "Cấu trúc so sánh đúng: 'A was twice as high as B'",
      "Cách dùng mạo từ với tính từ so sánh nhất: 'the largest', 'the smallest'",
      "Chủ ngữ - Động từ đồng nhất: 'The data indicate' (data có thể là số nhiều)"
    ]
  },
  table: {
    introduction: [
      "Paraphrase: 'The table shows data for... countries from... to...'",
      "Bao gồm: Cái gì? (loại dữ liệu), Số quốc gia, Thời gian",
      "Nêu đơn vị nếu được chỉ định (ví dụ: 'in thousands of students')"
    ],
    overview: [
      "TÓM TẮT: Xác định quốc gia cao nhất và thấp nhất (Mục 3.1)",
      "Nêu: 'Country A had the highest figure, while Country B had the lowest'",
      "Ghi chú bất kỳ mẫu nào hoặc bất thường đáng kể",
      "Tránh liệt kê tất cả các con số cụ thể"
    ],
    bodyParagraphs: [
      "Nhóm quốc gia theo hiệu suất: quốc gia hiệu suất cao vs quốc gia hiệu suất thấp",
      "Dùng: 'Country A stood at X%, compared to Y% for Country B'",
      "Nêu: 'The figure for A was significantly higher than that of B'",
      "Bao gồm 3-4 câu mỗi đoạn với dữ liệu cụ thể"
    ],
    vocabulary: [
      "So sánh: 'surpass', 'outpace', 'exceed', 'stand at', 'account for'",
      "Cao nhất: 'the highest', 'the largest', 'the most significant'",
      "Thấp nhất: 'the lowest', 'the least', 'the smallest'",
      "Khác biệt: 'gap', 'difference', 'disparity', 'contrast'"
    ],
    grammar: [
      "Cấu trúc so sánh đúng: 'A was higher than B'",
      "Giới từ đúng: 'compared to', 'compared with'",
      "Cách dùng mạo từ: 'the highest figure', 'a significant difference'",
      "Chủ ngữ - Động từ đồng nhất: 'The data show' (data là số nhiều)"
    ]
  },
  process: {
    introduction: [
      "Paraphrase: 'The diagram illustrates the process of...'",
      "Bao gồm: Cái gì? (quy trình), Số giai đoạn",
      "Dùng thì hiện tại đơn cho các quy trình chung"
    ],
    overview: [
      "TÓM TẮT: Nêu rằng đây là một quy trình với các giai đoạn riêng biệt (Mục 3.1)",
      "Nêu: 'The process consists of X stages from... to...'",
      "Ghi chú quy trình là tự nhiên hay do con người tạo ra",
      "Giữ ngắn gọn - lưu chi tiết cho thân bài"
    ],
    bodyParagraphs: [
      "Nhóm các giai đoạn một cách hợp lý: giai đoạn đầu trong đoạn 1, phần còn lại trong đoạn 2",
      "Dùng từ nối trình tự: 'Initially', 'Subsequently', 'Finally'",
      "Dùng bị động: 'The material is heated', 'It is then cooled'",
      "Bao gồm giới từ: 'from... to...', 'before...', 'after...'"
    ],
    vocabulary: [
      "Trình tự: 'First', 'Initially', 'Subsequently', 'Then', 'Finally'",
      "Động từ bị động: 'is heated', 'is cooled', 'is mixed', 'is poured'",
      "Giới từ: 'from... to...', 'before...', 'after...', 'while'",
      "Thuật ngữ quy trình: 'stage', 'step', 'process', 'procedure'"
    ],
    grammar: [
      "Dùng bị động cho quy trình: 'The water is heated', 'It is then cooled'",
      "Liên kết trình tự đúng: 'After being heated, the water boils'",
      "Chính xác giới từ: 'from stage 1 to stage 2'",
      "Thì hiện tại đơn cho các quy trình chung"
    ]
  }
}

export default function HintDrawer({ chartType }) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('introduction')

  // Close drawer when chart type changes
  useEffect(() => {
    setIsOpen(false)
    setActiveTab('introduction')
  }, [chartType])

  if (!chartType || !HINTS[chartType]) return null

  const tabs = Object.keys(HINTS[chartType])

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Floating Hint Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-3 bg-amber-400 hover:bg-amber-500 text-amber-900 rounded-full shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 active:scale-95"
        aria-label="Writing hints"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="font-medium">Gợi ý Viết</span>
      </button>

      {/* Drawer Panel */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-96 max-h-[70vh] bg-white rounded-xl shadow-2xl border border-amber-200 overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-amber-50 px-4 py-3 border-b border-amber-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-amber-900">Gợi ý IELTS Writing Task 1</h3>
                <p className="text-xs text-amber-700 mt-0.5">
                  Hướng dẫn cho biểu đồ {chartType.charAt(0).toUpperCase() + chartType.slice(1)}
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-amber-600 hover:text-amber-800 p-1 rounded hover:bg-amber-100 transition-colors"
                aria-label="Đóng gợi ý"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex overflow-x-auto border-b border-amber-100 bg-amber-50/50">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab
                    ? 'bg-white text-amber-700 border-b-2 border-amber-500'
                    : 'text-amber-600 hover:text-amber-800 hover:bg-amber-100/50'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-4 overflow-y-auto flex-1">
            <div className="space-y-4">
              {HINTS[chartType][activeTab].map((hint, index) => (
                <div key={index} className="flex gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{hint}</p>
                </div>
              ))}
            </div>

            {/* Quick Reference Section */}
            <div className="mt-6 pt-4 border-t border-amber-100">
              <h4 className="text-xs font-semibold text-amber-800 uppercase tracking-wide mb-2">
                Tham khảo nhanh
              </h4>
              <div className="text-xs text-gray-600 space-y-1">
                <p>• Overview là phần quan trọng nhất (Mục 3.1)</p>
                <p>• Dùng thì phù hợp cho dữ liệu của bạn (Mục 13)</p>
                <p>• Bao gồm so sánh và điểm dữ liệu cụ thể</p>
                <p>• Tránh từ lặp (dùng từ đồng nghĩa Mục 5-6)</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 py-2 bg-amber-50 border-t border-amber-200 text-center">
            <p className="text-[10px] text-amber-600">
              Dựa trên IELTS Writing Task 1 Master Rulebook
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
