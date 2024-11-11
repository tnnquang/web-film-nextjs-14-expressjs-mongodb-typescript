export interface IFilm {
  _id: string;
  title?: string;
  secondary_title?: string;
  description?: string;
  thumbnail?: string | any;
  poster?: string;
  category: any;
  year_release: string;
  duration?: string;
  total_episode?: string | number;
  // list_episode?:
  //   | {
  //       name: string;
  //       list_link: {
  //         title: string;
  //         link: string;
  //       };
  //     }[]
  //   | string
  //   | number;
  list_episode?: {
    name: string;
    list_link: {
      title: string;
      link: string;
    }[];
  }[];

  outstanding?: string;
  language?: string[];
  country?: string[];
  quality?: string;
  director: string[];
  performer?: string[];
  slug?: string | any;
  isDeleted?: boolean;
  rate?: {
    star_number: number;
    _id?: string;
    updatedAt?: string | Date;
    createdAt?: string | Date;
  }[];

  views?: number;
  updatedAt?: string | Date;
  createdAt?: string | Date;
}

export const TYPE_LIST_FILM_SINGLE_OR_SERIES = [
  "phim-le",
  "phim-bo",
  "phim-moi-cap-nhat",
  "phim-chieu-rap",
];

export const PERSONAL_TYPE = ["performer", "director"];

export type ListData = {
  categories: any[];
  countries: any[];
  qualities?: any[];
};


export type TADS_CONTENT = {
  id: number | string;
  index: number | string;
  content: string;
  href: string;
  mode: "single" | "dual";
  icon: string;
};

export type ITEM_ADS = {
  position: string;
  position_index: number | string;
  ads_content: TADS_CONTENT[];
};

export type TADS = {
  header: null | ITEM_ADS;
  footer: null | ITEM_ADS;
  row1: null | ITEM_ADS;
  row2: null | ITEM_ADS;
  row3: null | ITEM_ADS;
  slide: null | ITEM_ADS;
  popup: null | ITEM_ADS;
} | null;

export type H2HItemType = {
  matchId: string;
  compId: string;
  compName: string;
  compLogo: string;
  sportId: number;
  homeTeam: {
    id: string;
    name: string;
    logo: string;
    slug: string;
  };
  awayTeam: {
    id: string;
    name: string;
    logo: string;
    slug: string;
  };
  homeTotalScore?: number | null;
  awayTotalScore?: number | null;
  awayHalfScore?: number | null;

  statusId: number;
  matchStatus:
    | "NS"
    | "HT"
    | "ET"
    | "Penalties"
    | "FT"
    | "Postponed"
    | "Interrupted"
    | "Cut"
    | "Canceled"
    | "Pending"
    | "AET"
    | "AP"
    | string;

  homeTotalYellowCard?: number | null;
  awayTotalYellowCard?: number | null;
  awayTotalRedCard?: number | null;
  homeTotalCorner?: number | null;
  awayTotalCorner?: number | null;
  venue?: any;
  matchTime: number;
};

export type H2HType = {
  home: [H2HItemType];
};

export type SummaryType = {
  match: {
    matchId: string;
    compId: string;
    sportId: number;
    homeTeam: {
      id: string;
      name: string;
      logo: string;
      slug: string;
    };
    awayTeam: {
      id: string;
      name: string;
      logo: string;
      slug: string;
    };
    homeScores: [number];
    awayScores: [number];
    matchTime: number;
    venue?: any;
  };
  animation?: {
    ratio: number;
    url: string;
  };
  animations: [{ url: string; ratio: number; name: "2D" | "2.5D" | string }];
};

export type homePayerType = {
  [key: string | number]: {
    player: {
      id: string;
      name: string;
      sportId: number;
      hasStats: number;
      logo: string;
    };
    status: number;
    rating: string;
    shirtNumber: number;
    position: string;
    x: number;
    y: number;
  };
};

export type LineUpType = {
  lineup: {
    homeManager: {
      id: string;
      name: string;
      logo: string;
    };
    awayManager: {
      id: string;
      name: string;
      logo: string;
    };
    homeFormation: string;
    awayFormation: string;
    homeTeamRating: string;
    awayTeamRating: string;
    homePlayers: homePayerType;
  };
  playersInjury?: any;
};

export type NameOfEventType =
  | "Goal"
  | "Yellow Card"
  | "Red Card"
  | "Var"
  | "Pentalty"
  | "Start"
  | "Substitution"
  | "HT"
  | "FT";

export type EventItemType = {
  type: number;
  eventId: number;
  name: NameOfEventType;
  team?: {
    teamId: string;
  };
  player?: {
    playerId?: string;
    pid?: number;
    name: string;
  };
  inPlayer?: {
    inPlayerId: string;
    name: string;
    pId: number;
  };
  outPlayer?: {
    outPlayerId: string;
    name: string;
    pId: number;
  };
  awayScore?: number;
  homeScore?: number;
  belong?: number;
  time: string;
  assist?: { assistId: string; pid: number; name: string };
  reason?: string;
};

export type EventsType = [EventItemType];
export interface ScreenOrientation {
  lock(orientation: OrientationType): Promise<void>;
  unlock(): void;
}