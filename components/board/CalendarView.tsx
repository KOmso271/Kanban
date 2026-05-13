// components/board/CalendarView.tsx
"use client";
import { useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay, addMonths, subMonths } from "date-fns";
import { vi, enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = { vi: vi, en: enUS };
const localizer = dateFnsLocalizer({
  format, parse, startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }), getDay, locales,
});

export default function CalendarView({ tasks, onTaskClick, lang = "vi" }: any) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState("month");

  // 1. CHUẨN HÓA DỮ LIỆU SỰ KIỆN
  const events = tasks
    .filter((t: any) => t.due_date || t.start_date)
    .map((t: any) => {
      const startDate = t.start_date ? new Date(t.start_date) : new Date(t.due_date);
      const endDate = t.due_date ? new Date(t.due_date) : new Date(t.start_date);
      startDate.setHours(0, 0, 0, 0); endDate.setHours(23, 59, 59, 999);

      const priorityStr = t.priority ? String(t.priority).toLowerCase().trim() : "normal";
      return { id: t.id, title: t.content, start: startDate, end: endDate, resource: t, priorityStandard: priorityStr };
    });

  // 2. MÀU SẮC THẺ TASK (Làm mềm mại, bo tròn hơn)
  const eventStyleGetter = (event: any) => {
    let bgColor = "#10b981"; // Emerald mặc định
    switch (event.priorityStandard) {
      case "urgent": case "khẩn": bgColor = "#ef4444"; break;
      case "high": case "cao": bgColor = "#f97316"; break;
      case "normal": case "trung bình": case "bình thường": bgColor = "#3b82f6"; break; // Đổi normal sang Xanh dương cho trẻ trung
      case "low": case "thấp": bgColor = "#64748b"; break;
    }
    return {
      style: {
        backgroundColor: bgColor,
        borderRadius: "8px", // Bo góc tròn hơn
        opacity: 1,
        color: "white",
        border: "none",
        fontSize: "11.5px",
        fontWeight: "600",
        padding: "3px 8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.05)", // Thêm shadow nhẹ tạo chiều sâu
        marginTop: "2px",
      },
    };
  };

  // 3. THANH CÔNG CỤ CUSTOM (Siêu đẹp, chuẩn UI hiện đại)
  const CustomToolbar = (toolbar: any) => {
    const goToBack = () => toolbar.onNavigate('PREV');
    const goToNext = () => toolbar.onNavigate('NEXT');
    const goToCurrent = () => toolbar.onNavigate('TODAY');

    return (
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        {/* Nhóm nút Hôm nay + Mũi tên */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-[#0E1116] p-1 rounded-xl border border-slate-200 dark:border-slate-800">
          <button onClick={goToCurrent} className="px-4 py-1.5 text-[13px] font-bold text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-[#1C1F26] rounded-lg transition-colors shadow-sm">
            {lang === "vi" ? "Hôm nay" : "Today"}
          </button>
          <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1"></div>
          <button onClick={goToBack} className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-white dark:hover:bg-[#1C1F26] rounded-lg transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <button onClick={goToNext} className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-white dark:hover:bg-[#1C1F26] rounded-lg transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>

        {/* Tiêu đề Tháng/Năm siêu to khổng lồ */}
        <h2 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white capitalize tracking-tight">
          {format(toolbar.date, lang === "vi" ? "MMMM, yyyy" : "MMMM yyyy", { locale: lang === "vi" ? vi : enUS })}
        </h2>

        {/* Nhóm nút Chuyển View (Tháng/Tuần/Ngày) */}
        <div className="flex bg-slate-100 dark:bg-[#0E1116] p-1 rounded-xl border border-slate-200 dark:border-slate-800">
          {['month', 'week', 'day'].map((viewName) => (
            <button
              key={viewName}
              onClick={() => toolbar.onView(viewName)}
              className={`px-4 py-1.5 text-[13px] font-bold rounded-lg transition-all capitalize ${
                toolbar.view === viewName 
                  ? "bg-white dark:bg-[#1C1F26] text-blue-600 shadow-sm" 
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              {lang === "vi" ? (viewName === 'month' ? 'Tháng' : viewName === 'week' ? 'Tuần' : 'Ngày') : viewName}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full w-full p-4 md:p-6 bg-slate-50 dark:bg-[#0E1116] overflow-y-auto hide-scrollbar flex flex-col">
      
      {/* KHỐI CSS OVERRIDE LÀM ĐẸP GIAO DIỆN LỊCH */}
      <style dangerouslySetInnerHTML={{__html: `
        /* Làm mờ và bo tròn viền khung lịch */
        .rbc-month-view, .rbc-time-view {
          border: 1px solid rgba(203, 213, 225, 0.5) !important;
          border-radius: 16px !important;
          overflow: hidden;
          background: transparent;
        }
        .dark .rbc-month-view, .dark .rbc-time-view { border-color: rgba(51, 65, 85, 0.5) !important; }
        
        /* Cột Header (T2, T3, T4...) */
        .rbc-header {
          border-bottom: 1px solid rgba(203, 213, 225, 0.5) !important;
          border-left: none !important;
          padding: 12px 0 !important;
          font-weight: 700 !important;
          font-size: 12px !important;
          text-transform: uppercase;
          color: #64748b;
        }
        .dark .rbc-header { border-bottom-color: rgba(51, 65, 85, 0.5) !important; color: #94a3b8; }
        
        /* Lưới bên trong */
        .rbc-day-bg {
          border-left: 1px dashed rgba(203, 213, 225, 0.5) !important;
          transition: background-color 0.2s ease;
        }
        .dark .rbc-day-bg { border-left-color: rgba(51, 65, 85, 0.3) !important; }
        .rbc-month-row { border-top: 1px dashed rgba(203, 213, 225, 0.5) !important; }
        .dark .rbc-month-row { border-top-color: rgba(51, 65, 85, 0.3) !important; }
        
        /* Hover vào ngày bất kỳ */
        .rbc-day-bg:hover { background-color: rgba(241, 245, 249, 0.5); }
        .dark .rbc-day-bg:hover { background-color: rgba(30, 41, 59, 0.3); }
        
        /* Style cho ô HÔM NAY */
        .rbc-today { background-color: rgba(59, 130, 246, 0.05) !important; }
        .dark .rbc-today { background-color: rgba(59, 130, 246, 0.1) !important; }
        
        /* Chữ số của Ngày */
        .rbc-date-cell {
          padding: 8px 8px 0 0 !important;
          font-size: 13px;
          font-weight: 600;
          color: #334155;
        }
        .dark .rbc-date-cell { color: #cbd5e1; }
        .rbc-date-cell.rbc-now { color: #2563eb; font-weight: 800; }
        .dark .rbc-date-cell.rbc-now { color: #60a5fa; }
        
        /* Loại bỏ border Outline khi click */
        .rbc-event:focus { outline: none !important; }
        .rbc-active { outline: none !important; }
      `}} />

      <div className="bg-white dark:bg-[#1C1F26] p-4 md:p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 flex-1 min-h-[700px] flex flex-col">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          culture={lang}
          onSelectEvent={(event) => onTaskClick(event.resource)}
          eventPropGetter={eventStyleGetter}
          views={["month", "week", "day"]}
          
          date={currentDate}
          onNavigate={(newDate) => setCurrentDate(newDate)}
          view={currentView as any}
          onView={(newView) => setCurrentView(newView)}
          
          components={{
            toolbar: CustomToolbar // 👈 GỌI THANH TOOLBAR MỚI VÀO ĐÂY
          }}
          className="font-sans flex-1"
        />
      </div>
    </div>
  );
}