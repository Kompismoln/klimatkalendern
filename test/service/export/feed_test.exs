defmodule Mobilizon.Service.Feed do
  use Mobilizon.DataCase

  import Mobilizon.Factory

  alias Mobilizon.Actors.Actor
  alias Mobilizon.Events.{Event, FeedToken}
  alias Mobilizon.Service.Export.Feed, as: FeedService

  describe "export the instance's public events" do
    test "succeds" do
      %Event{} = event1 = insert(:event, title: "I'm public")
      %Event{} = event2 = insert(:event, visibility: :private, title: "I'm private")
      %Event{} = event3 = insert(:event, title: "Another public", picture: nil)
      %Event{} = event4 = insert(:event, title: "No description", description: nil)

      {:commit, rss} = FeedService.create_cache("instance")
      assert rss =~ "<title>#{String.replace(event1.title, "'", "&apos;")}</title>"
      refute rss =~ "<title>#{String.replace(event2.title, "'", "&apos;")}</title>"
      assert rss =~ "<title>#{String.replace(event3.title, "'", "&apos;")}</title>"
      assert rss =~ "<title>#{String.replace(event4.title, "'", "&apos;")}</title>"

      assert Enum.sort(Regex.scan(~r|\<link type=\"image/.*\/\>|, rss)) ==
               Enum.sort([
                 [
                   "<link type=\"#{event1.picture.file.content_type}\" length=\"#{event1.picture.file.size}\" rel=\"enclosure\" href=\"#{event1.picture.file.url}\"/>"
                 ],
                 [
                   "<link type=\"#{event4.picture.file.content_type}\" length=\"#{event4.picture.file.size}\" rel=\"enclosure\" href=\"#{event4.picture.file.url}\"/>"
                 ]
               ])
    end

    test "with 50 events" do
      Enum.each(0..50, fn i ->
        %Event{} = insert(:event, title: "Event #{i}")
      end)

      {:commit, rss} = FeedService.create_cache("instance")

      Enum.each(0..50, fn i ->
        assert rss =~ "<title>Event #{i}</title>"
      end)
    end

    test "an actor feedtoken" do
      user = insert(:user)
      actor = insert(:actor, user: user)
      %FeedToken{token: token} = insert(:feed_token, user: user, actor: actor)
      event = insert(:event)
      insert(:participant, event: event, actor: actor, role: :participant)

      tags_maped =
        Enum.map_join(
          Enum.sort(event.tags, &(&1.slug >= &2.slug)),
          "\n    ",
          &"<category label=\"#{&1.title}\" term=\"#{&1.slug}\"/>"
        )

      # credo:disable-for-lines:30 CredoCodeClimate
      expectedrss = """
      <?xml version="1.0" encoding="UTF-8"?>
      <feed xmlns="http://www.w3.org/2005/Atom">
        <logo>#{actor.banner.url}</logo>
        <icon>#{actor.avatar.url}</icon>
        <generator uri="http://mobilizon.test" version="#{Mobilizon.Config.instance_version()}">Test instance</generator>
        <link rel="alternate" href="#{actor.url}"/>
        <link rel="self" href="http://mobilizon.test/@#{actor.preferred_username}/feed/atom"/>
        <author>
          <name>#{Actor.display_name(actor)}</name>
          <uri>#{actor.url}</uri>
        </author>
        <id>http://mobilizon.test/@#{actor.preferred_username}/feed/atom</id>
        <title>#{Actor.display_name(actor)}&apos;s private events feed on Test instance</title>
        <updated></updated>
        <entry>
          #{tags_maped}
          <link type="#{event.picture.file.content_type}" length="#{event.picture.file.size}" rel="enclosure" href="#{event.picture.file.url}"/>
          <published>#{DateTime.to_iso8601(event.publish_at)}</published>
          <content type="html"><![CDATA[Ceci est une description avec une première phrase assez longue,
            puis sur une seconde ligne]]></content>
          <link type="text/html" rel="alternate" href="#{event.url}"/>
          <id>#{event.url}</id>
          <title>#{event.title}</title>
          <updated></updated>
        </entry>
      </feed>
      """

      {:commit, rss} = FeedService.create_cache("token_#{ShortUUID.encode!(token)}")
      rss = Regex.replace(~r|\<updated\>.*\</updated\>|, rss, "<updated></updated>")
      assert rss == String.replace(expectedrss, "</feed>\n", "</feed>")
    end
  end
end
