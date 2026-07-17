export type BackgroundVideo = {
  id: string;
  label: string;
  src: string | null;
};

export const BACKGROUND_VIDEO_STORAGE_KEY = "background-video";

// a cached video is only redownloaded when url is changed
export const BACKGROUND_VIDEOS: BackgroundVideo[] = [
  { id: "title_1st_1", label: "1st PV", src: "/videos/title_1st_1.webm" },
  { id: "title_2nd_1", label: "2nd PV", src: "/videos/title_2nd_1.webm" },
  { id: "title_3rd_1", label: "3rd PV", src: "/videos/title_3rd_1.webm" },
  { id: "title_4nd_2", label: "4th PV", src: "/videos/title_4nd_2.webm" },
  { id: "title_4nd_Ep", label: "4.5th PV", src: "/videos/title_4nd_Ep.webm" },
  { id: "title_5th_1", label: "5th PV", src: "/videos/title_5th_1.webm" },
  { id: "title_6th_1", label: "6th PV", src: "/videos/title_6th_1.webm" },
  { id: "_", label: "None", src: null },
];
