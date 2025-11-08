import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

interface AnalyticsData {
  totalVisits: number;
  uniqueVisitors: number;
  visitsByDay: Array<{ date: string; visits: number }>;
  visitsByHour: Array<{ hour: string; visits: number }>;
  peakHours: Array<{ hour: number; visits: number }>;
  visitsByCountry: Array<{ country: string; visits: number }>;
  visitsByGeolocation: Array<{
    city: string;
    country: string;
    visits: number;
    latitude?: number;
    longitude?: number;
  }>;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { articleId: string } }
) {
  try {
    const { articleId } = params;

    if (!articleId) {
      return NextResponse.json(
        { error: true, reason: "Article ID is required" },
        { status: 400 }
      );
    }

    // Fetch all logs for this article from Supabase
    const { data: logs, error } = await supabase
      .from("user_logs")
      .select("*")
      .eq("article_id", articleId);

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: true, reason: "Failed to fetch logs from database" },
        { status: 500 }
      );
    }

    if (!logs || logs.length === 0) {
      return NextResponse.json({
        totalVisits: 0,
        uniqueVisitors: 0,
        visitsByDay: [],
        visitsByHour: [],
        peakHours: [],
        visitsByCountry: [],
        visitsByCity: [],
        visitsByGeolocation: [],
      });
    }

    // Calculate total visits
    const totalVisits = logs.length;

    // Calculate unique visitors
    const uniqueUserIds = new Set(logs.map((log) => log.user_id));
    const uniqueVisitors = uniqueUserIds.size;

    // Group visits by day
    const visitsByDayMap = new Map<string, number>();
    logs.forEach((log) => {
      const date = log.timestamp
        ? new Date(log.timestamp).toISOString().split("T")[0]
        : "unknown";
      visitsByDayMap.set(date, (visitsByDayMap.get(date) || 0) + 1);
    });

    const visitsByDay = Array.from(visitsByDayMap.entries())
      .map(([date, visits]) => ({ date, visits }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Group visits by hour (peak hours)
    const peakHoursMap = new Map<number, number>();
    const visitsByHourMap = new Map<string, number>();

    logs.forEach((log) => {
      if (log.timestamp) {
        const date = new Date(log.timestamp);
        const hour = date.getHours();
        const hourString = `${String(hour).padStart(2, "0")}:00`;

        peakHoursMap.set(hour, (peakHoursMap.get(hour) || 0) + 1);
        visitsByHourMap.set(hourString, (visitsByHourMap.get(hourString) || 0) + 1);
      }
    });

    const peakHours = Array.from(peakHoursMap.entries())
      .map(([hour, visits]) => ({ hour, visits }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 24);

    const visitsByHour = Array.from(visitsByHourMap.entries())
      .map(([hour, visits]) => ({ hour, visits }))
      .sort((a, b) => a.hour.localeCompare(b.hour));

    // Group visits by country (only count unique users per country)
    const visitsByCountryMap = new Map<string, Set<string>>();
    logs.forEach((log) => {
      const location = log.location as Record<string, any>;
      const country = location?.country_name || "Unknown";
      if (!visitsByCountryMap.has(country)) {
        visitsByCountryMap.set(country, new Set());
      }
      visitsByCountryMap.get(country)!.add(log.user_id);
    });

    const visitsByCountry = Array.from(visitsByCountryMap.entries())
      .map(([country, userIds]) => ({ country, visits: userIds.size }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 10);

    // Group visits by geolocation (only count unique users per location)
    const visitsByGeolocationMap = new Map<
      string,
      { city: string; country: string; userIds: Set<string>; latitude?: number; longitude?: number }
    >();

    logs.forEach((log) => {
      const location = log.location as Record<string, any>;
      const city = location?.city || "Unknown";
      const country = location?.country_name || "Unknown";
      const key = `${city},${country}`;

      if (visitsByGeolocationMap.has(key)) {
        visitsByGeolocationMap.get(key)!.userIds.add(log.user_id);
      } else {
        visitsByGeolocationMap.set(key, {
          city,
          country,
          userIds: new Set([log.user_id]),
          latitude: location?.latitude,
          longitude: location?.longitude,
        });
      }
    });

    const visitsByGeolocation = Array.from(visitsByGeolocationMap.values())
      .map((item) => ({
        city: item.city,
        country: item.country,
        visits: item.userIds.size,
        latitude: item.latitude,
        longitude: item.longitude,
      }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 20);

    const analytics: AnalyticsData = {
      totalVisits,
      uniqueVisitors,
      visitsByDay,
      visitsByHour,
      peakHours,
      visitsByCountry,
      visitsByGeolocation,
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: true, reason: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
