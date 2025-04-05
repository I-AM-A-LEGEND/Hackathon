declare module '@fullcalendar/react' {
  export interface FullCalendarProps {
    plugins?: any[];
    headerToolbar?: any;
    initialView?: string;
    editable?: boolean;
    selectable?: boolean;
    selectMirror?: boolean;
    dayMaxEvents?: boolean | number;
    weekends?: boolean;
    events?: any[];
    select?: (info: any) => void;
    eventContent?: (arg: any) => any;
    [key: string]: any;
  }
  
  const FullCalendar: React.FC<FullCalendarProps>;
  export default FullCalendar;
}

declare module '@fullcalendar/daygrid' {
  const plugin: any;
  export default plugin;
}

declare module '@fullcalendar/timegrid' {
  const plugin: any;
  export default plugin;
}

declare module '@fullcalendar/interaction' {
  const plugin: any;
  export default plugin;
}

declare module '@fullcalendar/core' {
  export interface EventContentArg {
    event: {
      title: string;
      [key: string]: any;
    };
    timeText: string;
    [key: string]: any;
  }
  
  export interface DateSelectArg {
    start: Date;
    end: Date;
    [key: string]: any;
  }
} 